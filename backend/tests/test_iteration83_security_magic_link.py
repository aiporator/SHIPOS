"""Iter 83 — Login security tracking, Magic Link, /security/overview, revoke-other-sessions.

Tests cover:
- /api/health and /api/monitoring/health (boot sanity)
- /api/auth/login captures device context (browser/os/device_type/fingerprint/method)
- /api/auth/register stores signup_geo, signup_ua, login_history
- /api/auth/magic-link/request 200 for both existent + non-existent (no enumeration)
- /api/auth/magic-link/verify: bad token → 401, valid token → 200, replay → 401
- Magic link rate limit (5 per 15min, 6th → 429)
- /api/auth/security/overview shape + is_current uniqueness
- /api/auth/security/revoke-other-sessions removes all but current
- Unauthenticated /security/overview → 401
"""
import os
import time
import hashlib
import pytest
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://command-center-229.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

CHROME_MAC_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) "
                 "AppleWebKit/605.1.15 (KHTML, like Gecko) "
                 "Chrome/130.0.0.0 Safari/537.36")

ADMIN_EMAIL = "test@test.com"
ADMIN_PW = "test123"


# ---------- fixtures ----------

@pytest.fixture(scope="module")
def admin_session():
    """Logged-in session with cookie + bearer token for admin user."""
    s = requests.Session()
    r = s.post(f"{API}/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PW},
               headers={"User-Agent": CHROME_MAC_UA},
               timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    s.headers.update({"Authorization": f"Bearer {data['token']}"})
    return s


@pytest.fixture(scope="module")
def mongo_db():
    """Direct mongo access for DB-injected magic link token tests (sync pymongo)."""
    from pymongo import MongoClient

    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    client = MongoClient(mongo_url)
    db = client[db_name]

    class DBHelper:
        def __init__(self, db):
            self.db = db

        def insert_magic_link(self, raw_token: str, email: str, ttl_min: int = 15):
            now = datetime.now(timezone.utc)
            return self.db.magic_links.insert_one({
                "_id": hashlib.sha256(raw_token.encode("utf-8")).hexdigest(),
                "email": email,
                "created_at": now,
                "expires_at": now + timedelta(minutes=ttl_min),
                "used_at": None,
                "request_ip": "127.0.0.1",
            })

        def cleanup_magic_links(self, email: str):
            return self.db.magic_links.delete_many({"email": email})

        def cleanup_user(self, email: str):
            return self.db.users.delete_one({"email": email})

        def cleanup_login_attempts(self, ip_substr: str = None, email: str = None):
            q = {}
            if email:
                q["email"] = email
            return self.db.login_attempts.delete_many(q)

    yield DBHelper(db)
    client.close()


# ---------- 1. Boot / health ----------

class TestHealth:
    def test_api_health(self):
        r = requests.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_monitoring_health(self):
        r = requests.get(f"{API}/monitoring/health", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert "sentry" in body
        assert "posthog" in body
        assert "env" in body


# ---------- 2. Login captures device context ----------

class TestLoginContext:
    def test_login_captures_context_and_security_overview_reflects_it(self, admin_session):
        # Fresh login with explicit UA so we know what to look for
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PW},
                   headers={"User-Agent": CHROME_MAC_UA},
                   timeout=15)
        assert r.status_code == 200
        token = r.json()["token"]
        s.headers.update({"Authorization": f"Bearer {token}"})

        # GET security overview
        ov = s.get(f"{API}/auth/security/overview", timeout=10)
        assert ov.status_code == 200, ov.text
        body = ov.json()
        assert "login_history" in body and isinstance(body["login_history"], list)
        assert "sessions" in body and isinstance(body["sessions"], list)
        assert "signup" in body
        assert "password_changed_at" in body
        assert len(body["login_history"]) >= 1
        latest = body["login_history"][0]  # newest first
        assert latest.get("browser") == "Chrome", f"expected Chrome, got {latest.get('browser')}"
        assert latest.get("os") == "macOS", f"expected macOS, got {latest.get('os')}"
        assert latest.get("device_type") == "desktop"
        assert latest.get("method") == "email"
        fp = latest.get("fingerprint", "")
        assert isinstance(fp, str) and len(fp) == 16, f"fingerprint should be 16 chars, got {len(fp)}"
        # city/country may be empty (preview egress IP) — that's acceptable
        assert "city" in latest and "country_code" in latest
        assert "ip" in latest and latest["ip"]


# ---------- 3. Register captures context ----------

class TestRegisterContext:
    def test_register_stores_full_context(self, mongo_db):
        ts = int(time.time())
        email = f"sec-test-{ts}@test.com"
        try:
            r = requests.post(
                f"{API}/auth/register",
                json={"email": email, "password": "SecTest1234!", "name": "Sec Test"},
                headers={"User-Agent": CHROME_MAC_UA},
                timeout=15,
            )
            assert r.status_code == 200, r.text
            token = r.json()["token"]
            s = requests.Session()
            s.headers.update({"Authorization": f"Bearer {token}"})
            ov = s.get(f"{API}/auth/security/overview", timeout=10)
            assert ov.status_code == 200
            body = ov.json()
            assert len(body["login_history"]) >= 1
            entry = body["login_history"][0]
            assert entry.get("browser") == "Chrome"
            assert entry.get("os") == "macOS"
            assert entry.get("method") == "register"
            assert body["signup"]["at"]
        finally:
            mongo_db.cleanup_user(email)


# ---------- 4. Magic link request — no enumeration ----------

class TestMagicLinkRequest:
    def test_existing_email_returns_200(self, mongo_db):
        # ensure clean rate-limit bucket
        mongo_db.cleanup_login_attempts(email=f"magic:{ADMIN_EMAIL}")
        r = requests.post(f"{API}/auth/magic-link/request",
                          json={"email": ADMIN_EMAIL}, timeout=10)
        assert r.status_code == 200, r.text
        assert "message" in r.json()

    def test_nonexistent_email_returns_200_same_message(self, mongo_db):
        ts = int(time.time())
        nonexistent = f"nonexistent-{ts}@example.com"
        mongo_db.cleanup_login_attempts(email=f"magic:{nonexistent}")
        r = requests.post(f"{API}/auth/magic-link/request",
                          json={"email": nonexistent}, timeout=10)
        assert r.status_code == 200, r.text
        # Same generic message — no enumeration
        msg = r.json().get("message", "")
        assert "Postfach" in msg or "existiert" in msg or "Login-Link" in msg


# ---------- 5. Magic link verify ----------

class TestMagicLinkVerify:
    def test_bad_token_returns_401(self):
        r = requests.post(f"{API}/auth/magic-link/verify",
                          json={"token": "definitely-not-a-real-token-xyz123"},
                          timeout=10)
        assert r.status_code == 401
        assert "ungültig" in r.json().get("detail", "").lower() or "expired" in r.json().get("detail", "").lower() or "ungultig" in r.json().get("detail", "").lower()

    def test_valid_token_works_and_is_single_use(self, mongo_db):
        # Inject a fresh token directly into DB for ADMIN_EMAIL
        import secrets
        raw_token = secrets.token_urlsafe(48)
        mongo_db.insert_magic_link(raw_token, ADMIN_EMAIL, ttl_min=15)

        # First call — should succeed
        s = requests.Session()
        r1 = s.post(f"{API}/auth/magic-link/verify",
                    json={"token": raw_token},
                    headers={"User-Agent": CHROME_MAC_UA},
                    timeout=15)
        assert r1.status_code == 200, f"valid token should work: {r1.status_code} {r1.text}"
        body = r1.json()
        assert "token" in body and body["token"]
        assert "user" in body and body["user"]["email"] == ADMIN_EMAIL
        # Cookie should be set
        assert "session_token" in s.cookies, "session_token cookie not set after magic-link verify"

        # Second call with same token — must fail (single-use)
        r2 = requests.post(f"{API}/auth/magic-link/verify",
                           json={"token": raw_token}, timeout=10)
        assert r2.status_code == 401, f"replay should be blocked, got {r2.status_code}"


# ---------- 6. Magic link rate limit ----------

class TestMagicLinkRateLimit:
    def test_six_rapid_requests_429_on_sixth(self, mongo_db):
        ts = int(time.time())
        email = f"ratelimit-{ts}@example.com"
        mongo_db.cleanup_login_attempts(email=f"magic:{email}")

        statuses = []
        for i in range(6):
            r = requests.post(f"{API}/auth/magic-link/request",
                              json={"email": email}, timeout=10)
            statuses.append(r.status_code)
        # First 5 must be 200, the 6th must be 429
        assert statuses[:5] == [200] * 5, f"first 5 should be 200, got {statuses[:5]}"
        assert statuses[5] == 429, f"6th attempt should be 429, got {statuses[5]} (all: {statuses})"

        mongo_db.cleanup_login_attempts(email=f"magic:{email}")


# ---------- 7. Security overview shape ----------

class TestSecurityOverview:
    def test_unauthenticated_returns_401(self):
        r = requests.get(f"{API}/auth/security/overview", timeout=10)
        assert r.status_code == 401

    def test_authenticated_shape(self, admin_session):
        r = admin_session.get(f"{API}/auth/security/overview", timeout=10)
        assert r.status_code == 200
        body = r.json()
        # Required keys
        for k in ("login_history", "sessions", "signup", "password_changed_at"):
            assert k in body, f"missing key {k}"
        # Sessions shape
        sessions = body["sessions"]
        assert isinstance(sessions, list)
        if sessions:
            s0 = sessions[0]
            for k in ("id", "created_at", "expires_at", "ip", "method", "is_current"):
                assert k in s0, f"session missing key {k}"
        # Exactly one is_current=True
        current_count = sum(1 for s in sessions if s.get("is_current"))
        assert current_count == 1, f"expected exactly 1 current session, got {current_count}"
        # History shape — only validate that LATEST entry has all new keys
        # (older pre-iter-83 entries may lack browser/os/etc — that is acceptable
        # and tracked as a minor backend issue in the test report)
        if body["login_history"]:
            latest = body["login_history"][0]
            for k in ("ip", "at", "method", "browser", "os", "device_type",
                      "city", "country_code", "fingerprint"):
                assert k in latest, f"latest history entry missing key {k}: {latest}"


# ---------- 8. Revoke other sessions ----------

class TestRevokeOtherSessions:
    def test_revoke_others_keeps_current(self, mongo_db):
        # Clean stale failed-login attempts (per-email/IP brute-force counter)
        mongo_db.cleanup_login_attempts(email=ADMIN_EMAIL)
        # Use unique X-Forwarded-For per session to avoid the global
        # /api/auth/* per-IP rate-limit (20/min) saturated by prior tests.
        sessions = []
        for i in range(3):
            s = requests.Session()
            r = s.post(f"{API}/auth/login",
                       json={"email": ADMIN_EMAIL, "password": ADMIN_PW},
                       headers={
                           "User-Agent": CHROME_MAC_UA,
                           "X-Forwarded-For": f"10.42.{i}.{i+10}",
                       },
                       timeout=15)
            assert r.status_code == 200, f"login {i} failed: {r.status_code} {r.text}"
            s.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
            sessions.append(s)
            time.sleep(0.3)

        # Last session = "current"; revoke from it (reuse its X-Forwarded-For)
        current = sessions[-1]
        r = current.post(f"{API}/auth/security/revoke-other-sessions",
                         headers={"X-Forwarded-For": "10.42.2.12"},
                         timeout=10)
        assert r.status_code == 200, r.text
        revoked = r.json().get("revoked", 0)
        assert revoked >= 2, f"expected at least 2 revoked sessions, got {revoked}"

        # Current session still works (/auth/me with cookie)
        me = current.get(f"{API}/auth/me",
                         headers={"X-Forwarded-For": "10.42.2.12"},
                         timeout=10)
        assert me.status_code == 200
        assert me.json().get("email") == ADMIN_EMAIL
