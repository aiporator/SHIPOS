"""Iter 86 — auth hardening tests: leeway JWT, deprecated stripe webhook, inbound sync secret, /auth/me cookie."""
import os
import jwt
import pytest
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fall back to reading frontend/.env file
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass

JWT_SECRET = None
INBOUND_SYNC_SECRET = None
try:
    with open("/app/backend/.env") as f:
        for line in f:
            if line.startswith("JWT_SECRET="):
                JWT_SECRET = line.split("=", 1)[1].strip().strip('"').strip("'")
            if line.startswith("INBOUND_SYNC_SECRET="):
                INBOUND_SYNC_SECRET = line.split("=", 1)[1].strip().strip('"').strip("'")
except Exception:
    pass


@pytest.fixture(scope="module")
def session():
    return requests.Session()


# ─────────── Auth login + /auth/me ───────────

def test_login_test_user_returns_200_and_cookies(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": "test@test.com", "password": "test123"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "user" in data
    assert data["user"]["email"] == "test@test.com"
    # session_token cookie should be set
    assert "session_token" in session.cookies or "session_token" in r.cookies, (
        f"No session_token cookie: {dict(r.cookies)}"
    )


def test_auth_me_with_cookie_returns_user(session):
    # Reuse session from login above (cookies persist)
    r = session.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("email") == "test@test.com"
    assert "_id" not in data  # Mongo ObjectId must be excluded


def test_auth_me_without_cookie_returns_401():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


# ─────────── JWT leeway=10 absorbs forward-clock skew ───────────

@pytest.mark.skipif(not JWT_SECRET, reason="JWT_SECRET not loadable from backend/.env")
def test_jwt_with_5s_future_iat_is_accepted():
    """A JWT issued 5s in the future should still authenticate thanks to leeway=10."""
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": "user_legacy_admin",  # Will likely 404 user-lookup but token decode must pass
        "iat": now + timedelta(seconds=5),
        "nbf": now + timedelta(seconds=5),
        "exp": now + timedelta(days=1),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    r = requests.get(f"{BASE_URL}/api/auth/me",
                     headers={"Authorization": f"Bearer {token}"})
    # Token must NOT be rejected outright as invalid (would be 401 without leeway).
    # Either: 200 (user exists) OR 401 (user not found post-decode).
    # We confirm decode succeeded by issuing a known good user_id from login.
    # Use the test@test.com user_id from a real login to actually pass through.
    login = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "test@test.com", "password": "test123"})
    user_id = login.json()["user"]["user_id"]
    payload["user_id"] = user_id
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    r = requests.get(f"{BASE_URL}/api/auth/me",
                     headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, f"JWT with +5s iat rejected (leeway not active?): {r.status_code} {r.text}"


@pytest.mark.skipif(not JWT_SECRET, reason="JWT_SECRET not loadable")
def test_jwt_with_30s_future_iat_is_rejected():
    """Sanity: 30s skew exceeds leeway=10 and must be rejected as auth failure."""
    login = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "test@test.com", "password": "test123"})
    user_id = login.json()["user"]["user_id"]
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "iat": now + timedelta(seconds=30),
        "nbf": now + timedelta(seconds=30),
        "exp": now + timedelta(days=1),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    r = requests.get(f"{BASE_URL}/api/auth/me",
                     headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401


# ─────────── Deprecated Stripe webhook returns 410 ───────────

def test_stripe_webhook_returns_410_gone():
    r = requests.post(f"{BASE_URL}/api/webhook/stripe", json={})
    assert r.status_code == 410, r.text
    body = r.json()
    assert body.get("detail") == "endpoint_deprecated"
    assert "canonical_endpoint" in body


# ─────────── Inbound sync secret enforcement ───────────

def test_sync_health_without_secret_returns_401_or_503():
    r = requests.get(f"{BASE_URL}/api/internal/sync/health")
    # 401 if secret configured, 503 if not configured
    assert r.status_code in (401, 503), f"Expected 401/503, got {r.status_code}: {r.text}"


@pytest.mark.skipif(not INBOUND_SYNC_SECRET, reason="INBOUND_SYNC_SECRET not set in backend/.env")
def test_sync_health_with_valid_secret_returns_200():
    r = requests.get(f"{BASE_URL}/api/internal/sync/health",
                     headers={"X-Sync-Secret": INBOUND_SYNC_SECRET})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("status") == "ok"


def test_sync_health_with_wrong_secret_returns_401():
    r = requests.get(f"{BASE_URL}/api/internal/sync/health",
                     headers={"X-Sync-Secret": "totally-wrong"})
    assert r.status_code in (401, 503)


# ─────────── /auth/providers exposes google_client_id (used by ReAuthModal) ───────────

def test_auth_providers_endpoint_works():
    r = requests.get(f"{BASE_URL}/api/auth/providers")
    assert r.status_code == 200, r.text
    data = r.json()
    assert "providers" in data
