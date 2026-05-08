"""
Iteration 76 — Password Change endpoint tests
POST /api/auth/password/change

Cases:
- 401 wrong current_password
- 400 new_password < 6 chars
- 400 new_password == current_password
- 200 success + login with new password works
- After success, RESET back to test123 (so other tests don't break)
"""
import os
import pytest
import requests

def _load_base_url():
    url = os.environ.get('REACT_APP_BACKEND_URL', '')
    if not url:
        try:
            with open('/app/frontend/.env') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        url = line.split('=', 1)[1].strip()
                        break
        except Exception:
            pass
    return url.rstrip('/')

BASE_URL = _load_base_url()
TEST_EMAIL = "standard@wladbot.test"
ORIGINAL_PW = "test123"
TEMP_PW = "newpass456"


def _login(email: str, password: str):
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": password},
                      timeout=15)
    return r


@pytest.fixture(scope="module")
def auth_headers():
    r = _login(TEST_EMAIL, ORIGINAL_PW)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    token = r.json().get("token")
    assert token
    return {"Authorization": f"Bearer {token}"}


def test_password_change_wrong_current(auth_headers):
    r = requests.post(f"{BASE_URL}/api/auth/password/change",
                      headers=auth_headers,
                      json={"current_password": "WRONG_PASS",
                            "new_password": "anothernew123"},
                      timeout=15)
    assert r.status_code == 401, f"expected 401 got {r.status_code} {r.text}"
    detail = r.json().get("detail", "")
    assert "Aktuelles Passwort" in detail or "falsch" in detail.lower(), detail


def test_password_change_too_short(auth_headers):
    r = requests.post(f"{BASE_URL}/api/auth/password/change",
                      headers=auth_headers,
                      json={"current_password": ORIGINAL_PW,
                            "new_password": "abc"},
                      timeout=15)
    assert r.status_code == 400, f"expected 400 got {r.status_code} {r.text}"


def test_password_change_same_as_current(auth_headers):
    r = requests.post(f"{BASE_URL}/api/auth/password/change",
                      headers=auth_headers,
                      json={"current_password": ORIGINAL_PW,
                            "new_password": ORIGINAL_PW},
                      timeout=15)
    assert r.status_code == 400, f"expected 400 got {r.status_code} {r.text}"


def test_password_change_success_and_relogin_and_reset(auth_headers):
    # Step 1: change to TEMP_PW
    r = requests.post(f"{BASE_URL}/api/auth/password/change",
                      headers=auth_headers,
                      json={"current_password": ORIGINAL_PW,
                            "new_password": TEMP_PW},
                      timeout=15)
    assert r.status_code == 200, f"expected 200 got {r.status_code} {r.text}"
    msg = r.json().get("message", "")
    assert "erfolgreich" in msg.lower() or "geändert" in msg.lower(), msg

    # Step 2: login with NEW password should succeed
    r2 = _login(TEST_EMAIL, TEMP_PW)
    assert r2.status_code == 200, f"new pw login failed: {r2.status_code} {r2.text}"
    new_token = r2.json().get("token")
    assert new_token

    # Step 3: login with OLD password should fail
    r3 = _login(TEST_EMAIL, ORIGINAL_PW)
    assert r3.status_code == 401, f"old pw should fail, got {r3.status_code}"

    # Step 4: RESET back to ORIGINAL_PW so other tests work
    new_headers = {"Authorization": f"Bearer {new_token}"}
    r4 = requests.post(f"{BASE_URL}/api/auth/password/change",
                       headers=new_headers,
                       json={"current_password": TEMP_PW,
                             "new_password": ORIGINAL_PW},
                       timeout=15)
    assert r4.status_code == 200, f"reset failed: {r4.status_code} {r4.text}"

    # Verify reset by logging in with ORIGINAL_PW
    r5 = _login(TEST_EMAIL, ORIGINAL_PW)
    assert r5.status_code == 200, f"final login with original failed: {r5.status_code} {r5.text}"


def test_password_change_unauthenticated():
    r = requests.post(f"{BASE_URL}/api/auth/password/change",
                      json={"current_password": ORIGINAL_PW,
                            "new_password": "whatever123"},
                      timeout=15)
    assert r.status_code in (401, 403), f"unauth expected 401/403 got {r.status_code}"


# Sanity: routes should still be reachable (REGRESSION: /referral /downloads /enterprise still in App.js)
def test_route_check_login_still_works():
    r = _login(TEST_EMAIL, ORIGINAL_PW)
    assert r.status_code == 200
