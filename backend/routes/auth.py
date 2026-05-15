"""Authentication routes — Enterprise-grade security."""
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError
import uuid
import httpx
from datetime import datetime, timezone, timedelta

from config import db, OAUTH_SESSION_URL, logger
from models import UserRegister, UserLogin
from services import create_jwt_token, hash_password, verify_password, get_current_user, update_user_scores
from services_actions import record_user_action

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Cookie config — shared across all endpoints for consistency
COOKIE_CONFIG = {
    "key": "session_token",
    "httponly": True,
    "samesite": "lax",
    "secure": True,
    "max_age": 7 * 24 * 3600,  # 7 days
    "path": "/",
}

# Brute-force protection: max failed logins per (email, ip) combo per window
MAX_FAILED_ATTEMPTS = 10
ATTEMPT_WINDOW_MINUTES = 15


async def _check_rate_limit(email: str, ip: str) -> None:
    """Raise 429 if too many failed login attempts in the window."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=ATTEMPT_WINDOW_MINUTES)
    count = await db.login_attempts.count_documents({
        "email": email,
        "ip": ip,
        "created_at": {"$gte": cutoff},
        "success": False,
    })
    if count >= MAX_FAILED_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Zu viele fehlgeschlagene Login-Versuche. Bitte warte 15 Minuten oder nutze Passwort-Reset."
        )


async def _log_login_attempt(email: str, ip: str, success: bool) -> None:
    """Record a login attempt for rate-limiting analysis."""
    now = datetime.now(timezone.utc)
    await db.login_attempts.insert_one({
        "email": email,
        "ip": ip,
        "success": success,
        "created_at": now,
        "expires_at": now + timedelta(hours=24),  # auto-cleanup via TTL
    })


async def _create_session(user_id: str, ip_address: str, response: Response, method: str = "email") -> str:
    """Create a server-side session, set cookie, and clean up old sessions."""
    session_token = f"sess_{uuid.uuid4().hex}"

    # Limit sessions per user to 10 (prevents session table bloat)
    existing = await db.user_sessions.find(
        {"user_id": user_id}, {"_id": 1}
    ).sort("created_at", 1).to_list(50)
    if len(existing) >= 10:
        oldest_ids = [s["_id"] for s in existing[:len(existing) - 9]]
        await db.user_sessions.delete_many({"_id": {"$in": oldest_ids}})

    await db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user_id,
        "ip_address": ip_address,
        "method": method,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(value=session_token, **COOKIE_CONFIG)
    return session_token


def _get_client_ip(request: Request) -> str:
    """Extract real client IP, handling proxies."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _safe_user_output(user: dict) -> dict:
    """Strip sensitive fields from user document before sending to client.

    Computes `is_admin` server-side (DB flag OR email allowlist) so the frontend
    never has to know the allowlist itself.
    """
    # Lazy import to avoid circular dep at module-load
    from routes.admin import ADMIN_EMAILS
    email = (user.get("email") or "").lower()
    is_admin = bool(user.get("is_admin")) or email in {e.lower() for e in ADMIN_EMAILS}
    safe = {k: v for k, v in user.items() if k not in ("password_hash", "_id", "login_history", "signup_ip", "last_login_ip")}
    safe["is_admin"] = is_admin
    return safe


# ========== REGISTER ==========

@router.post("/register")
async def register(data: UserRegister, request: Request, response: Response):
    # Normalize email (case-insensitive uniqueness)
    email = data.email.strip().lower()
    ip_address = _get_client_ip(request)

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": email,
        "name": data.name.strip(),
        "password_hash": hash_password(data.password),
        "picture": None,
        "position": "",
        "company": "",
        "industry": "",
        "leadership_score": 0,
        "eq_score": 0,
        "communication_score": 0,
        "level": "Emerging Leader",
        "xp": 0,
        "premium": False,
        "signup_ip": ip_address,
        "last_login_ip": ip_address,
        "login_history": [{"ip": ip_address, "at": datetime.now(timezone.utc).isoformat(), "method": "email"}],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await db.users.insert_one(user_doc)
    except DuplicateKeyError:
        # Race-safe: unique index catches parallel duplicate registrations
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        logger.error(f"Register insert failed: {e}")
        raise HTTPException(status_code=500, detail="Registration failed — please try again")

    token = create_jwt_token(user_id)
    await _create_session(user_id, ip_address, response, method="register")
    await record_user_action(user_id, "register")

    # Mirror to Supabase (fire-and-forget — does not block response)
    from services_supabase_sync import mirror_user_event_fire_and_forget
    mirror_user_event_fire_and_forget(
        mongo_user_id=user_id,
        email=email,
        full_name=data.name.strip(),
        event="user.created",
    )

    # JWT token kept for backwards-compat API consumers; frontend uses httpOnly cookie only
    return {"token": token, "user": _safe_user_output(user_doc)}


# ========== LOGIN ==========

@router.post("/login")
async def login(data: UserLogin, request: Request, response: Response):
    email = (data.email or "").strip().lower()
    ip_address = _get_client_ip(request)

    # Enterprise: brute-force protection
    await _check_rate_limit(email, ip_address)

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        await _log_login_attempt(email, ip_address, success=False)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await _log_login_attempt(email, ip_address, success=True)
    await db.users.update_one({"user_id": user["user_id"]}, {
        "$set": {"last_login_ip": ip_address, "last_login_at": datetime.now(timezone.utc).isoformat()},
        "$push": {"login_history": {"$each": [{"ip": ip_address, "at": datetime.now(timezone.utc).isoformat(), "method": "email"}], "$slice": -50}}
    })

    token = create_jwt_token(user["user_id"])
    await _create_session(user["user_id"], ip_address, response, method="email")

    return {"token": token, "user": _safe_user_output(user)}


# ========== GOOGLE AUTH ==========

@router.post("/google-session")
async def google_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(OAUTH_SESSION_URL, headers={"X-Session-ID": session_id})
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        google_data = resp.json()

    email = google_data["email"]
    ip_address = _get_client_ip(request)

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {
            "$set": {
                "name": google_data.get("name", existing.get("name")),
                "picture": google_data.get("picture", existing.get("picture")),
                "last_login_ip": ip_address,
                "last_login_at": datetime.now(timezone.utc).isoformat(),
            },
            "$push": {"login_history": {"$each": [{"ip": ip_address, "at": datetime.now(timezone.utc).isoformat(), "method": "google"}], "$slice": -50}}
        })
        sync_event = "user.updated"
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "name": google_data.get("name", "User"),
            "picture": google_data.get("picture"), "leadership_score": 0, "eq_score": 0,
            "communication_score": 0, "level": "Emerging Leader", "xp": 0,
            "signup_ip": ip_address, "last_login_ip": ip_address,
            "login_history": [{"ip": ip_address, "at": datetime.now(timezone.utc).isoformat(), "method": "google"}],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        sync_event = "user.created"

    # Generate a real JWT token (not the session_token)
    token = create_jwt_token(user_id)
    await _create_session(user_id, ip_address, response, method="google")

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})

    # Mirror to Supabase (fire-and-forget)
    from services_supabase_sync import mirror_user_event_fire_and_forget
    mirror_user_event_fire_and_forget(
        mongo_user_id=user_id,
        email=email,
        full_name=user.get("name") or "",
        event=sync_event,
        extra={"auth_method": "google"},
    )

    return {"user": _safe_user_output(user), "token": token}


# ========== SESSION MANAGEMENT ==========

@router.get("/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return _safe_user_output(user)


@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    """Refresh an expiring JWT token. Returns a fresh token if current session is valid."""
    user = await get_current_user(request)
    ip_address = _get_client_ip(request)
    token = create_jwt_token(user["user_id"])
    await _create_session(user["user_id"], ip_address, response, method="refresh")
    return {"token": token, "user": _safe_user_output(user)}


@router.get("/company-context")
async def get_company_context(request: Request):
    user = await get_current_user(request)
    return user.get("company_context", {
        "team_size": "", "branche": "", "challenges": "",
        "goals": "", "people_notes": "", "ai_tasks_enabled": True,
    })


# ========== PROFILE ==========

VALID_RATING_MODES = {"soft", "hard"}
VALID_RATING_LEVELS = {"einsteiger", "fortgeschritten", "executive"}
VALID_RATING_FOCUS = {"klarheit", "empathie", "struktur", "ueberzeugungskraft"}
VALID_RATING_AUDIENCE = {"team", "board", "kunden", "investoren", "allgemein"}
COMPANY_CONTEXT_FIELDS = ("team_size", "branche", "challenges", "goals", "people_notes", "ai_tasks_enabled")


def _sanitize_rating_preferences(rp: dict) -> dict:
    sanitized = {}
    if rp.get("mode") in VALID_RATING_MODES:
        sanitized["mode"] = rp["mode"]
    if rp.get("level") in VALID_RATING_LEVELS:
        sanitized["level"] = rp["level"]
    if isinstance(rp.get("focus"), list):
        sanitized["focus"] = [f for f in rp["focus"] if f in VALID_RATING_FOCUS]
    if rp.get("audience") in VALID_RATING_AUDIENCE:
        sanitized["audience"] = rp["audience"]
    return sanitized


def _sanitize_company_context(cc: dict) -> dict:
    return {field: cc[field] for field in COMPANY_CONTEXT_FIELDS if field in cc}


@router.put("/profile")
async def update_profile(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    allowed = {"name", "position", "company", "industry", "rating_preferences", "company_context"}
    updates = {k: v for k, v in body.items() if k in allowed and v is not None}

    if "rating_preferences" in updates:
        updates["rating_preferences"] = _sanitize_rating_preferences(updates["rating_preferences"])
    if "company_context" in updates:
        updates["company_context"] = _sanitize_company_context(updates["company_context"])

    if updates:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
    user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return _safe_user_output(user)


# ========== LOGOUT ==========

@router.post("/logout")
async def logout(request: Request, response: Response):
    # Delete session from cookie
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})

    # Also try to invalidate JWT-based session
    bearer = request.headers.get("Authorization", "")
    if bearer.startswith("Bearer "):
        token = bearer.split(" ")[1]
        # If token matches a session, delete it too
        session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session:
            await db.user_sessions.delete_one({"session_token": token})

    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}



# ── Password change (authenticated) ───────────────────────────────────────

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/password/change")
async def change_password(data: PasswordChangeRequest, request: Request):
    """Authenticated user changes their own password.

    Requires current password to prevent CSRF/session-hijack lateral attacks.
    Invalidates all OTHER sessions on success (keeps current cookie alive).
    """
    user = await get_current_user(request)

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Neues Passwort muss min. 6 Zeichen haben.")
    if data.new_password == data.current_password:
        raise HTTPException(status_code=400, detail="Neues Passwort darf nicht identisch zum aktuellen sein.")

    full_user = await db.users.find_one({"user_id": user["user_id"]}, {"password_hash": 1, "_id": 0})
    if not full_user or not verify_password(data.current_password, full_user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Aktuelles Passwort ist falsch.")

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "password_hash": hash_password(data.new_password),
            "password_changed_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    # Invalidate OTHER sessions (everywhere except current cookie/JWT)
    current_token = request.cookies.get("session_token") or ""
    bearer = request.headers.get("Authorization", "")
    if bearer.startswith("Bearer "):
        current_token = current_token or bearer.split(" ", 1)[1]
    if current_token:
        await db.user_sessions.delete_many({
            "user_id": user["user_id"],
            "session_token": {"$ne": current_token},
        })
    else:
        await db.user_sessions.delete_many({"user_id": user["user_id"]})

    return {"message": "Passwort erfolgreich geändert."}
