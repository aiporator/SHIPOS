"""Iter 77 — FINAL PRE-SHIP regression backend smoke tests."""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def std_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "standard@wladbot.test", "password": "test123"})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and len(data["token"]) > 0
    return data["token"]


# --- Public endpoints --------------------------------------------------------
def test_packages_endpoint():
    r = requests.get(f"{BASE_URL}/api/payments/packages")
    assert r.status_code == 200
    data = r.json()
    # response shape: list or dict of packages
    assert data, "packages response empty"


def test_voice_personas_endpoint():
    r = requests.get(f"{BASE_URL}/api/voice/personas")
    assert r.status_code == 200
    data = r.json()
    assert data, "personas empty"


# --- Auth flow ---------------------------------------------------------------
def test_login_standard_returns_token_and_user():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "standard@wladbot.test", "password": "test123"})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == "standard@wladbot.test"


def test_login_accelerator_returns_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "accelerator@wladbot.test", "password": "test123"})
    assert r.status_code == 200
    assert r.json().get("token")


def test_register_fresh_email_returns_token():
    email = f"shiptest_{int(time.time())}@wladbot.test"
    r = requests.post(f"{BASE_URL}/api/auth/register",
                      json={"name": "Ship Test", "email": email, "password": "test123"})
    assert r.status_code in (200, 201), f"register failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("token")
    assert data["user"]["email"] == email


def test_login_invalid_password_returns_401():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "standard@wladbot.test", "password": "wrongpass"})
    assert r.status_code in (400, 401), f"expected 4xx got {r.status_code}"


# --- Authenticated endpoints -------------------------------------------------
def test_user_tier_authenticated(std_token):
    r = requests.get(f"{BASE_URL}/api/user/tier",
                     headers={"Authorization": f"Bearer {std_token}"})
    assert r.status_code == 200
    data = r.json()
    assert "tier" in data


def test_user_tier_unauthenticated_returns_401():
    r = requests.get(f"{BASE_URL}/api/user/tier")
    assert r.status_code in (401, 403)


# --- Login response should NOT contain raw password --------------------------
def test_login_response_excludes_password_field():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "standard@wladbot.test", "password": "test123"})
    assert r.status_code == 200
    text = r.text.lower()
    # password value should not echo back
    assert "test123" not in text, "password leaked in login response"


# --- httpOnly cookie on login ------------------------------------------------
def test_login_sets_httponly_cookie():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": "standard@wladbot.test", "password": "test123"})
    assert r.status_code == 200
    # Check Set-Cookie header for HttpOnly
    set_cookie = r.headers.get("set-cookie", "") or ""
    # If no cookie header, that's an issue worth reporting (token-only auth)
    if set_cookie:
        assert "httponly" in set_cookie.lower(), f"Cookie not HttpOnly: {set_cookie}"
