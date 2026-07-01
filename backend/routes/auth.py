"""Authentication routes — Enterprise-grade security."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr
from pymongo.errors import DuplicateKeyError
import os
import re
import uuid
import httpx
import jwt
from datetime import datetime, timezone, timedelta

from config import db, OAUTH_SESSION_URL, logger
from models import UserRegister, UserLogin
from services import create_jwt_token, hash_password, verify_password, get_current_user
from services_actions import record_user_action
from services_login_security import (
    parse_user_agent,
    device_fingerprint,
    lookup_geo,
    fire_and_forget_new_device_alert,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def _send_signup_welcome(email: str, name: str) -> None:
    """Send the post-signup welcome email. Silently no-ops if Resend isn't configured."""
    try:
        from services_email import send_email, signup_welcome_email, is_enabled
        if not is_enabled() or not email:
            return
        # Dedup: don't send the same welcome twice if signup race / replays
        already = await db.email_log.find_one(
            {"user_email": email, "type": "signup_welcome"}, {"_id": 0}
        )
        if already:
            return
        subject, html = signup_welcome_email(name or email.split("@")[0])
        r = await send_email(email, subject, html)
        await db.email_log.insert_one({
            "user_email": email, "type": "signup_welcome",
            "sent": r["sent"], "email_id": r.get("email_id"),
            "error": r.get("error"),
            "sent_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.warning("Signup welcome email failed for %s: %s", email, e)


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


async def _capture_login_context(request: Request) -> dict:
    """Gather full login context: IP, UA, geo, device fingerprint.

    Geo lookup runs concurrently with a hard timeout — never blocks login >2.5s.
    Returns a dict ready to be stored in user.login_history[].
    """
    ip = _get_client_ip(request)
    ua_parsed = parse_user_agent(request.headers.get("user-agent", ""))
    geo = await lookup_geo(ip)
    fingerprint = device_fingerprint(ip, ua_parsed)
    return {
        "ip": ip,
        "at": datetime.now(timezone.utc).isoformat(),
        "ua": ua_parsed,
        "geo": geo,
        "fingerprint": fingerprint,
    }


def _login_history_entry(ctx: dict, method: str) -> dict:
    """Shape a login_history record (flat, queryable)."""
    return {
        "ip": ctx["ip"],
        "at": ctx["at"],
        "method": method,
        "browser": ctx["ua"].get("browser", ""),
        "os": ctx["ua"].get("os", ""),
        "device_type": ctx["ua"].get("device_type", ""),
        "city": ctx["geo"].get("city", ""),
        "country_code": ctx["geo"].get("country_code", ""),
        "fingerprint": ctx["fingerprint"],
    }


def _safe_user_output(user: dict) -> dict:
    """Strip sensitive fields from user document before sending to client.

    Computes `is_admin` server-side (DB flag OR email allowlist) so the frontend
    never has to know the allowlist itself.
    """
    # Lazy import to avoid circular dep at module-load
    from routes.admin import ADMIN_EMAILS
    email = (user.get("email") or "").lower()
    is_admin = bool(user.get("is_admin")) or email in {e.lower() for e in ADMIN_EMAILS}
    safe = {k: v for k, v in user.items() if k not in ("password_hash", "_id", "login_history", "signup_ip", "last_login_ip", "session_token")}
    safe["is_admin"] = is_admin
    return safe


# ========== REGISTER ==========

MAX_REGISTER_ATTEMPTS = 5
REGISTER_WINDOW_MINUTES = 60


async def _check_register_rate_limit(ip: str) -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=REGISTER_WINDOW_MINUTES)
    count = await db.login_attempts.count_documents({
        "ip": ip,
        "created_at": {"$gte": cutoff},
        "method": "register",
    })
    if count >= MAX_REGISTER_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many registrations — try again later")


@router.post("/register")
async def register(data: UserRegister, request: Request, response: Response):
    # Normalize email (case-insensitive uniqueness)
    email = data.email.strip().lower()
    ctx = await _capture_login_context(request)
    ip_address = ctx["ip"]

    await _check_register_rate_limit(ip_address)

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    history_entry = _login_history_entry(ctx, method="register")
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
        "signup_geo": ctx["geo"],
        "signup_ua": ctx["ua"],
        "last_login_ip": ip_address,
        "last_login_geo": ctx["geo"],
        "last_login_ua": ctx["ua"],
        "login_history": [history_entry],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.login_attempts.insert_one({
        "ip": ip_address, "email": email, "method": "register",
        "created_at": datetime.now(timezone.utc), "success": True,
    })
    try:
        await db.users.insert_one(user_doc)
    except DuplicateKeyError:
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

    # Auto-sync leader-check.de diagnosis if user already exists in Supabase
    # leadership_insights table by email (fire-and-forget — does not block signup).
    import asyncio as _asyncio
    from services_wladhub_autosync import auto_sync_wladhub_on_signup
    _asyncio.create_task(auto_sync_wladhub_on_signup(user_id=user_id, email=email))

    # Welcome email (fire-and-forget — non-blocking)
    _asyncio.create_task(_send_signup_welcome(email, data.name.strip()))

    # JWT token kept for backwards-compat API consumers; frontend uses httpOnly cookie only
    return {"token": token, "user": _safe_user_output(user_doc)}


# ========== LOGIN ==========

@router.post("/login")
async def login(data: UserLogin, request: Request, response: Response):
    email = (data.email or "").strip().lower()
    ctx = await _capture_login_context(request)
    ip_address = ctx["ip"]

    # Enterprise: brute-force protection
    await _check_rate_limit(email, ip_address)

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        await _log_login_attempt(email, ip_address, success=False)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await _log_login_attempt(email, ip_address, success=True)
    history_entry = _login_history_entry(ctx, method="email")
    await db.users.update_one({"user_id": user["user_id"]}, {
        "$set": {
            "last_login_ip": ip_address,
            "last_login_at": history_entry["at"],
            "last_login_geo": ctx["geo"],
            "last_login_ua": ctx["ua"],
        },
        "$push": {"login_history": {"$each": [history_entry], "$slice": -50}}
    })

    # New-device alert (fire-and-forget — never delays login response)
    fire_and_forget_new_device_alert(
        user_email=email,
        user_name=user.get("name") or "",
        ip=ip_address,
        ua_parsed=ctx["ua"],
        geo=ctx["geo"],
        fingerprint=ctx["fingerprint"],
        login_history=(user.get("login_history") or []) + [history_entry],
        method="email",
    )

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

    # Guard against missing OAuth config — fail with a friendly 503 instead
    # of a Python TypeError that swamps the logs.
    if not OAUTH_SESSION_URL:
        raise HTTPException(
            status_code=503,
            detail="Google login is not configured on this environment. Use email/password.",
        )

    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(OAUTH_SESSION_URL, headers={"X-Session-ID": session_id})
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        google_data = resp.json()

    email = google_data["email"]
    ctx = await _capture_login_context(request)
    ip_address = ctx["ip"]

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    history_entry = _login_history_entry(ctx, method="google")
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {
            "$set": {
                "name": google_data.get("name", existing.get("name")),
                "picture": google_data.get("picture", existing.get("picture")),
                "last_login_ip": ip_address,
                "last_login_at": history_entry["at"],
                "last_login_geo": ctx["geo"],
                "last_login_ua": ctx["ua"],
            },
            "$push": {"login_history": {"$each": [history_entry], "$slice": -50}}
        })
        sync_event = "user.updated"
        # New-device email for existing Google user
        fire_and_forget_new_device_alert(
            user_email=email,
            user_name=existing.get("name") or "",
            ip=ip_address,
            ua_parsed=ctx["ua"],
            geo=ctx["geo"],
            fingerprint=ctx["fingerprint"],
            login_history=(existing.get("login_history") or []) + [history_entry],
            method="google",
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "name": google_data.get("name", "User"),
            "picture": google_data.get("picture"), "leadership_score": 0, "eq_score": 0,
            "communication_score": 0, "level": "Emerging Leader", "xp": 0,
            "signup_ip": ip_address, "signup_geo": ctx["geo"], "signup_ua": ctx["ua"],
            "last_login_ip": ip_address, "last_login_geo": ctx["geo"], "last_login_ua": ctx["ua"],
            "login_history": [history_entry],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        sync_event = "user.created"
        # Fire welcome email for new Google user (fire-and-forget)
        import asyncio as _asyncio
        _asyncio.create_task(_send_signup_welcome(email, google_data.get("name") or email.split("@")[0]))

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


# ========== LEADER-CHECK → LEADER-OS SYNC HANDOFF ==========
# The leader-check.de landing (separate Emergent backend) hands a signed,
# short-lived `sync_token` to this product. We verify it here and mint a
# first-party session — so a lead flows Landing → Product WITHOUT a second
# login, and lands straight in the funnel (e.g. /free-videos).
#
# Contract with the leader-check side:
#   - HS256 JWT signed with a SHARED secret. This product reads it from
#     SYNC_JWT_SECRET (preferred) or REPORT_JWT_SECRET. If neither is set the
#     endpoint fails safe with 503 (never mints a session on an unverifiable
#     token).
#   - Standard `exp` claim enforced (their token is ~10 min).
#   - Email in one of: email / user_email / e / sub(if it's an email).
#   - Optional `typ`/`purpose`/`scope`: if present it MUST be a sync purpose —
#     this stops a `report_token` (different purpose) being replayed here.
#   - Optional `jti`: if present, the token is single-use (replay-proof).

SYNC_ALLOWED_PURPOSES = {"sync", "leader_os_sync", "leader-os-sync", "leaderos_sync"}


def _sync_signing_secrets() -> list[str]:
    return [s for s in (os.environ.get("SYNC_JWT_SECRET"), os.environ.get("REPORT_JWT_SECRET")) if s]


def _decode_sync_token(token: str) -> Optional[dict]:
    """Verify signature + expiry against the shared secret(s). None if invalid."""
    for secret in _sync_signing_secrets():
        try:
            return jwt.decode(token, secret, algorithms=["HS256"], leeway=10)
        except jwt.ExpiredSignatureError:
            # Correct secret (signature passed) but expired → reject, don't retry.
            return None
        except jwt.InvalidTokenError:
            # Wrong secret / malformed → try the next configured secret.
            continue
    return None


def _sync_identity(payload: dict) -> tuple[Optional[str], str]:
    """Extract (email_lower, name) from sync-token claims. email None if absent."""
    email = ""
    for k in ("email", "user_email", "e"):
        if payload.get(k):
            email = str(payload[k]).strip().lower()
            break
    if not email:
        sub = str(payload.get("sub", "")).strip().lower()
        if "@" in sub:
            email = sub
    name = ""
    for k in ("name", "full_name", "n"):
        if payload.get(k):
            name = str(payload[k]).strip()
            break
    return (email or None), name


class SyncExchange(BaseModel):
    sync_token: str


@router.post("/leader-os-sync")
async def leader_os_sync(data: SyncExchange, request: Request, response: Response):
    """Exchange a leader-check `sync_token` for a first-party Leader-OS session."""
    if not _sync_signing_secrets():
        # Fail safe — never mint a session when we can't verify the token.
        raise HTTPException(status_code=503, detail="Leader-Check sync ist nicht konfiguriert.")

    payload = _decode_sync_token(data.sync_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger oder abgelaufener Sync-Link.")

    purpose = payload.get("typ") or payload.get("purpose") or payload.get("scope")
    if purpose and str(purpose).lower() not in SYNC_ALLOWED_PURPOSES:
        raise HTTPException(status_code=401, detail="Token-Zweck nicht gültig für Login.")

    email, name = _sync_identity(payload)
    if not email:
        raise HTTPException(status_code=400, detail="Sync-Token enthält keine E-Mail.")

    # Optional single-use enforcement (replay protection) when a jti is present.
    jti = payload.get("jti")
    if jti and await db.consumed_sync_tokens.find_one({"jti": jti}, {"_id": 1}):
        raise HTTPException(status_code=401, detail="Dieser Sync-Link wurde bereits benutzt.")

    ctx = await _capture_login_context(request)
    ip_address = ctx["ip"]
    now_iso = datetime.now(timezone.utc).isoformat()
    history_entry = _login_history_entry(ctx, method="leader_check")

    # Case-insensitive match so we never fork a duplicate on email casing.
    existing = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}, {"_id": 0}
    )
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {
            "$set": {
                "name": name or existing.get("name"),
                "email_lower": email,
                "last_login_ip": ip_address,
                "last_login_at": history_entry["at"],
                "last_login_geo": ctx["geo"],
                "last_login_ua": ctx["ua"],
            },
            "$addToSet": {"meta_tags": "leader-check"},
            "$push": {"login_history": {"$each": [history_entry], "$slice": -50}},
        })
        sync_event = "user.updated"
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "email_lower": email,
            "name": name or email.split("@")[0],
            "leadership_score": 0, "eq_score": 0, "communication_score": 0,
            "level": "Emerging Leader", "xp": 0,
            "source_platform": "leader-check", "meta_tags": ["leader-check"],
            "signup_ip": ip_address, "signup_geo": ctx["geo"], "signup_ua": ctx["ua"],
            "last_login_ip": ip_address, "last_login_geo": ctx["geo"], "last_login_ua": ctx["ua"],
            "login_history": [history_entry],
            "created_at": now_iso,
        })
        sync_event = "user.created"
        import asyncio as _asyncio
        _asyncio.create_task(_send_signup_welcome(email, name or email.split("@")[0]))

    token = create_jwt_token(user_id)
    await _create_session(user_id, ip_address, response, method="leader_check")

    # This lead is now a registered user → stop the email-only free-video drip.
    try:
        await db.free_video_leads.update_one(
            {"email_lower": email}, {"$set": {"registered": True}}
        )
    except Exception:  # best-effort, never block the login
        pass

    if jti:
        await db.consumed_sync_tokens.insert_one({
            "jti": jti, "used_at": now_iso,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
        })

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})

    from services_supabase_sync import mirror_user_event_fire_and_forget
    mirror_user_event_fire_and_forget(
        mongo_user_id=user_id, email=email,
        full_name=user.get("name") or "", event=sync_event,
        extra={"auth_method": "leader_check_sync"},
    )

    return {"user": _safe_user_output(user), "token": token, "synced": True}


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

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Neues Passwort muss min. 8 Zeichen haben.")
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


# ========== MAGIC LINK (passwordless) ==========

class MagicLinkRequest(BaseModel):
    email: EmailStr
    # The visitor's own origin (window.location.origin). Validated against an
    # allowlist server-side so the link returns the user to the exact app host
    # they logged in from (leaderos.de / leadercheck.de). Untrusted input.
    redirect_base: Optional[str] = None


class MagicLinkVerify(BaseModel):
    token: str


@router.post("/magic-link/request")
async def magic_link_request(data: MagicLinkRequest, request: Request):
    """Request a passwordless login link via email.

    Always returns 200 with the same generic message — never confirms whether
    the email exists (prevents email enumeration attacks). Rate-limited by IP
    to prevent abuse.
    """
    from services_magic_link import create_token, send_magic_link_email

    email = data.email.strip().lower()
    ip = _get_client_ip(request)

    # Reuse brute-force collection as a soft cap (max 5 magic links per email per 15min)
    recent = await db.login_attempts.count_documents({
        "email": f"magic:{email}",
        "ip": ip,
        "created_at": {"$gte": datetime.now(timezone.utc) - timedelta(minutes=15)},
    })
    if recent >= 5:
        raise HTTPException(status_code=429, detail="Zu viele Magic-Link-Anfragen. Bitte warte 15 Minuten.")

    await db.login_attempts.insert_one({
        "email": f"magic:{email}",
        "ip": ip,
        "success": True,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
    })

    token = await create_token(email, ip)
    if token:
        await send_magic_link_email(email, token, base_url=data.redirect_base)

    return {"message": "Falls die E-Mail in unserem System existiert, haben wir dir einen Login-Link geschickt. Bitte prüfe dein Postfach."}


@router.post("/magic-link/verify")
async def magic_link_verify(data: MagicLinkVerify, request: Request, response: Response):
    """Exchange a magic-link token for a session. Token is single-use."""
    from services_magic_link import consume_token

    user = await consume_token(data.token)
    if not user:
        raise HTTPException(status_code=401, detail="Link ist ungültig, abgelaufen oder wurde bereits verwendet.")

    ctx = await _capture_login_context(request)
    history_entry = _login_history_entry(ctx, method="magic_link")
    await db.users.update_one({"user_id": user["user_id"]}, {
        "$set": {
            "last_login_ip": ctx["ip"],
            "last_login_at": history_entry["at"],
            "last_login_geo": ctx["geo"],
            "last_login_ua": ctx["ua"],
        },
        "$push": {"login_history": {"$each": [history_entry], "$slice": -50}}
    })

    fire_and_forget_new_device_alert(
        user_email=user["email"],
        user_name=user.get("name") or "",
        ip=ctx["ip"],
        ua_parsed=ctx["ua"],
        geo=ctx["geo"],
        fingerprint=ctx["fingerprint"],
        login_history=(user.get("login_history") or []) + [history_entry],
        method="magic_link",
    )

    token = create_jwt_token(user["user_id"])
    await _create_session(user["user_id"], ctx["ip"], response, method="magic_link")
    return {"token": token, "user": _safe_user_output(user)}


# ========== SECURITY / SESSIONS (authenticated) ==========

@router.get("/security/overview")
async def security_overview(request: Request):
    """Return login history + active sessions for the current user (Profile › Security)."""
    user = await get_current_user(request)
    full = await db.users.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0, "login_history": 1, "last_login_at": 1, "last_login_geo": 1,
         "last_login_ua": 1, "signup_ip": 1, "signup_geo": 1, "created_at": 1,
         "password_changed_at": 1},
    ) or {}

    # Last 20 entries (newest first) — backfill missing fields for old entries
    raw = list(reversed((full.get("login_history") or [])[-20:]))
    history = [
        {
            "ip": h.get("ip") or "",
            "at": h.get("at") or "",
            "method": h.get("method") or "email",
            "browser": h.get("browser") or "",
            "os": h.get("os") or "",
            "device_type": h.get("device_type") or "",
            "city": h.get("city") or "",
            "country_code": h.get("country_code") or "",
            "fingerprint": h.get("fingerprint") or "",
        }
        for h in raw
    ]

    # Active sessions (server-side cookie sessions)
    current_cookie = request.cookies.get("session_token") or ""
    sessions_cursor = db.user_sessions.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "session_token": 1, "created_at": 1, "ip_address": 1, "method": 1, "expires_at": 1},
    ).sort("created_at", -1)
    sessions = []
    async for s in sessions_cursor:
        is_current = s.get("session_token") == current_cookie
        sessions.append({
            "id": (s.get("session_token") or "")[-12:],  # last 12 chars as opaque id
            "created_at": s.get("created_at"),
            "expires_at": s.get("expires_at"),
            "ip": s.get("ip_address") or "",
            "method": s.get("method") or "",
            "is_current": is_current,
        })

    return {
        "login_history": history,
        "sessions": sessions,
        "signup": {
            "at": full.get("created_at"),
            "ip": full.get("signup_ip"),
            "geo": full.get("signup_geo") or {},
        },
        "password_changed_at": full.get("password_changed_at"),
    }


@router.post("/security/revoke-other-sessions")
async def revoke_other_sessions(request: Request):
    """Log out all other devices (keep current session alive)."""
    user = await get_current_user(request)
    current_cookie = request.cookies.get("session_token") or ""
    bearer = request.headers.get("Authorization", "")
    if bearer.startswith("Bearer "):
        current_cookie = current_cookie or bearer.split(" ", 1)[1]

    query = {"user_id": user["user_id"]}
    if current_cookie:
        query["session_token"] = {"$ne": current_cookie}
    result = await db.user_sessions.delete_many(query)
    return {"revoked": result.deleted_count}
