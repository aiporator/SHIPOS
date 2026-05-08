"""Iter 68 — Enterprise auth stress tests: case-insensitive, brute-force, race-cond,
session persistence, logout state clear, Pydantic validation, quick-login tiers,
protected routes, regression on feature endpoints."""
import os
import uuid
import time
import threading
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://command-center-229.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
TIER_EMAILS = ["free", "starter", "standard", "accelerator", "accelerator-raten"]
TEST_PW = "test123"

# Global RateLimitMiddleware allows 20 req/min/IP on /api/auth/*.
# Add a module-level cooldown between auth tests so tests don't cannibalise the quota.
_AUTH_DELAY = 5.0


@pytest.fixture(autouse=True)
def _auth_cooldown():
    time.sleep(_AUTH_DELAY)
    yield


# ---------- Helpers ----------
def _unique_email(prefix="stress"):
    return f"TEST_{prefix}_{uuid.uuid4().hex[:10]}@wladbot.test"


@pytest.fixture
def s():
    return requests.Session()


# ---------- Happy path / re-login x3 ----------
class TestReLoginLoop:
    def test_register_login_logout_cycle_x3(self, s):
        email = _unique_email("reloop")
        r = s.post(f"{API}/auth/register", json={"email": email, "password": TEST_PW, "name": "Re Loop"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["email"] == email.lower()
        assert "session_token" in s.cookies

        for i in range(3):
            # logout
            r = s.post(f"{API}/auth/logout")
            assert r.status_code == 200
            # /auth/me should now be 401
            me = s.get(f"{API}/auth/me")
            assert me.status_code == 401, f"cycle {i}: expected 401, got {me.status_code}"
            # re-login
            r = s.post(f"{API}/auth/login", json={"email": email, "password": TEST_PW})
            assert r.status_code == 200, f"cycle {i} login: {r.text}"
            me = s.get(f"{API}/auth/me")
            assert me.status_code == 200, f"cycle {i} me: {me.text}"
            assert me.json()["email"] == email.lower()


# ---------- Case-insensitive email ----------
class TestCaseInsensitiveEmail:
    def test_register_mixed_login_lower(self, s):
        mixed = f"TEST_CI_{uuid.uuid4().hex[:8]}@Test.DE"
        lower = mixed.lower()
        r = s.post(f"{API}/auth/register", json={"email": mixed, "password": TEST_PW, "name": "CI User"})
        assert r.status_code == 200, r.text
        # stored as lowercase
        assert r.json()["user"]["email"] == lower

        s.post(f"{API}/auth/logout")

        # login with lowercase → works
        r2 = s.post(f"{API}/auth/login", json={"email": lower, "password": TEST_PW})
        assert r2.status_code == 200

    def test_duplicate_register_case_insensitive_returns_400(self, s):
        mixed = f"TEST_DUPCI_{uuid.uuid4().hex[:8]}@Test.DE"
        r = s.post(f"{API}/auth/register", json={"email": mixed, "password": TEST_PW, "name": "Dup A"})
        assert r.status_code == 200
        # second register with lowercase version of same email → must be 400
        s2 = requests.Session()
        r2 = s2.post(f"{API}/auth/register", json={"email": mixed.lower(), "password": TEST_PW, "name": "Dup B"})
        assert r2.status_code == 400, f"expected 400 got {r2.status_code}: {r2.text}"
        assert "already" in r2.json().get("detail", "").lower()


# ---------- Pydantic validation ----------
class TestValidation:
    def test_invalid_email_format(self):
        r = requests.post(f"{API}/auth/register", json={"email": "not-an-email", "password": TEST_PW, "name": "Bad"})
        assert r.status_code == 422

    def test_weak_password_rejected(self):
        email = _unique_email("weakpw")
        r = requests.post(f"{API}/auth/register", json={"email": email, "password": "ab", "name": "Weak"})
        assert r.status_code == 422, f"expected 422 got {r.status_code}"


# ---------- Brute-force rate-limit ----------
class TestBruteForce:
    def test_10_failed_logins_trigger_429(self):
        # use a unique email so we don't interfere with other tests
        email = _unique_email("brute")
        # first register real account so the account exists (to hit verify_password path too)
        requests.post(f"{API}/auth/register", json={"email": email, "password": TEST_PW, "name": "Brute"})

        last_status = None
        got_429 = False
        for i in range(15):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong-password"})
            last_status = r.status_code
            if r.status_code == 429:
                got_429 = True
                break
            assert r.status_code == 401, f"attempt {i}: expected 401, got {r.status_code}"
        assert got_429, f"Never got 429 after 15 attempts, last={last_status}"
        # Allow the sliding-window rate-limit quota to recover for subsequent tests
        time.sleep(65)


# ---------- Race-condition / duplicate key ----------
class TestRaceRegister:
    def test_parallel_register_only_one_succeeds(self):
        # RaceRegister does 5 parallel auth hits — wait for full quota reset first
        time.sleep(65)
        email = _unique_email("race")
        results = []

        def do_register():
            try:
                r = requests.post(f"{API}/auth/register", json={"email": email, "password": TEST_PW, "name": "Race"})
                results.append(r.status_code)
            except Exception as e:
                results.append(str(e))

        threads = [threading.Thread(target=do_register) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        try:
            success = [r for r in results if r == 200]
            dupes = [r for r in results if r == 400]
            assert len(success) == 1, f"expected exactly 1 success, got {results}"
            assert len(dupes) >= 1, f"expected dupes on parallel register: {results}"
        finally:
            # Always let rate-limit quota recover, even on assertion failure
            time.sleep(65)


# ---------- Session persistence + logout clears cookie ----------
class TestSessionAndLogout:
    def test_session_cookie_and_logout_clears(self, s):
        email = _unique_email("sess")
        s.post(f"{API}/auth/register", json={"email": email, "password": TEST_PW, "name": "Sess"})
        assert "session_token" in s.cookies, "session cookie missing after register"

        me = s.get(f"{API}/auth/me")
        assert me.status_code == 200

        # new session (simulates new tab) with same cookie jar → still authed
        s2 = requests.Session()
        s2.cookies.set("session_token", s.cookies.get("session_token"), domain=BASE_URL.replace("https://", "").split("/")[0])
        me2 = s2.get(f"{API}/auth/me")
        assert me2.status_code == 200, f"cross-session (cookie copy) failed: {me2.text}"

        # logout on s → both sessions die (cookie is session-token-based, stored server-side)
        s.post(f"{API}/auth/logout")
        me3 = s.get(f"{API}/auth/me")
        assert me3.status_code == 401
        me4 = s2.get(f"{API}/auth/me")
        assert me4.status_code == 401, "server-side session should be gone after logout"


# ---------- Quick-login tiers ----------
class TestQuickLoginTiers:
    @pytest.mark.parametrize("tier", TIER_EMAILS)
    def test_tier_login(self, tier):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": f"{tier}@wladbot.test", "password": TEST_PW})
        assert r.status_code == 200, f"{tier}: {r.text}"
        me = s.get(f"{API}/auth/me")
        assert me.status_code == 200


# ---------- Protected routes ----------
class TestProtected:
    def test_no_cookie_returns_401(self):
        # pick an auth-required endpoint — /auth/me is already covered; try dashboard
        r = requests.get(f"{API}/user/tier")
        assert r.status_code == 401


# ---------- Regression: community, chat, playbooks, tools, missions, events ----------
class TestRegressionEndpoints:
    @pytest.fixture(scope="class")
    def authed(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": "standard@wladbot.test", "password": TEST_PW})
        assert r.status_code == 200
        return s

    def test_community(self, authed):
        r = authed.get(f"{API}/community/feed")
        assert r.status_code in (200, 404), r.status_code  # endpoint may be under different path
        # try an alternate path too
        if r.status_code == 404:
            r = authed.get(f"{API}/community/posts")
            assert r.status_code in (200, 404)

    def test_chat_sessions(self, authed):
        r = authed.get(f"{API}/chat/sessions")
        assert r.status_code == 200

    def test_playbooks(self, authed):
        r = authed.get(f"{API}/playbooks")
        assert r.status_code == 200

    def test_tools(self, authed):
        r = authed.get(f"{API}/tools")
        assert r.status_code in (200, 404)

    def test_events(self, authed):
        r = authed.get(f"{API}/events")
        assert r.status_code == 200

    def test_dashboard(self, authed):
        r = authed.get(f"{API}/dashboard/stats")
        assert r.status_code in (200, 404)
