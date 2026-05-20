"""Iter 84 — Direct OAuth (Google/Apple/Microsoft) + Continue-as persistence.

This test suite verifies:
  - /api/auth/providers discovery
  - Google/Apple/Microsoft callback graceful 401 when not configured
  - Existing flows (login/security/magic-link/health/openapi route discovery) still work
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"

ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "test@test.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "test123")


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_session(session):
    r = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    return session  # session already has the cookie


# ───── OAuth Provider Discovery ─────

class TestProvidersEndpoint:
    def test_providers_returns_200_and_shape(self, session):
        r = session.get(f"{BASE_URL}/api/auth/providers")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "providers" in data
        prov = data["providers"]
        for key in ("google", "apple", "microsoft", "magic_link"):
            assert key in prov, f"missing {key}"
        # All OAuth bools should be False (no env vars in preview)
        assert prov["google"] is False
        assert prov["apple"] is False
        assert prov["microsoft"] is False
        assert prov["magic_link"] is True
        # IDs should be empty strings
        assert data["google_client_id"] == ""
        assert data["apple_service_id"] == ""
        assert data["microsoft_client_id"] == ""
        assert data["microsoft_tenant"] == "common"

    def test_providers_is_public(self, session):
        # Clear session cookies and re-test without auth
        clean = requests.Session()
        r = clean.get(f"{BASE_URL}/api/auth/providers")
        assert r.status_code == 200


# ───── Callbacks return 401 with clear "not configured" error ─────

class TestOAuthCallbacksNotConfigured:
    def test_google_callback_401_not_configured(self, session):
        r = session.post(
            f"{BASE_URL}/api/auth/google/callback",
            json={"credential": "bad.token.xyz"},
        )
        assert r.status_code == 401, r.text
        body = r.json()
        detail = body.get("detail") or ""
        assert "GOOGLE_CLIENT_ID" in detail, detail

    def test_apple_callback_401_not_configured(self, session):
        r = session.post(
            f"{BASE_URL}/api/auth/apple/callback",
            json={"identity_token": "bad"},
        )
        assert r.status_code == 401, r.text
        detail = r.json().get("detail") or ""
        assert "APPLE_SERVICE_ID" in detail, detail

    def test_microsoft_callback_401_not_configured(self, session):
        r = session.post(
            f"{BASE_URL}/api/auth/microsoft/callback",
            json={"id_token": "bad"},
        )
        assert r.status_code == 401, r.text
        detail = r.json().get("detail") or ""
        assert "MICROSOFT_CLIENT_ID" in detail, detail


# ───── Existing flows still work ─────

class TestExistingFlows:
    def test_admin_login(self, admin_session):
        # Session has a cookie now
        cookies = admin_session.cookies
        assert any("session" in c.name.lower() or "token" in c.name.lower() for c in cookies), \
            f"Expected session cookie, got: {[c.name for c in cookies]}"

    def test_security_overview_with_cookie(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/auth/security/overview")
        assert r.status_code == 200, r.text
        data = r.json()
        # Iter 83 shape
        assert "current_session" in data or "sessions" in data or "login_history" in data

    def test_magic_link_request_generic_200(self, session):
        r = session.post(
            f"{BASE_URL}/api/auth/magic-link/request",
            json={"email": "doesnotexist@example.com"},
        )
        assert r.status_code == 200

    def test_health(self, session):
        r = session.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        body = r.json()
        # 'ok' should appear in some shape
        assert any(v in str(body).lower() for v in ("ok", "healthy"))

    def test_monitoring_health(self, session):
        r = session.get(f"{BASE_URL}/api/monitoring/health")
        assert r.status_code == 200
        body = r.json()
        assert "sentry" in body or "posthog" in body or "monitoring" in body


# ───── OpenAPI route registration ─────

class TestRouteRegistration:
    def test_all_auth_routes_registered(self, session):
        # openapi.json is internal-only (ingress only proxies /api/*),
        # so hit localhost directly for route discovery.
        r = requests.get("http://localhost:8001/openapi.json", timeout=10)
        assert r.status_code == 200
        paths = set(r.json().get("paths", {}).keys())
        expected = [
            "/api/auth/providers",
            "/api/auth/google/callback",
            "/api/auth/apple/callback",
            "/api/auth/microsoft/callback",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/me",
            "/api/auth/refresh",
            "/api/auth/magic-link/request",
            "/api/auth/magic-link/verify",
            "/api/auth/security/overview",
            "/api/auth/security/revoke-other-sessions",
            "/api/auth/logout",
            "/api/auth/password/change",
        ]
        missing = [p for p in expected if p not in paths]
        assert not missing, f"Missing routes: {missing}"
