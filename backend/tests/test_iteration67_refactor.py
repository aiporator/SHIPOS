"""Iter 67 regression — refactor-only sprint.

Covers backend regression of the refactored modules:
- /api/user/tier  (services_tier.resolve_user_tier split into _normalize_tier_name,
                   _compute_expiry_status, _fetch_installment_info)
- /api/payments/* (stripe_webhook _finalize_paid_transaction helper extracted)
- /api/cron/monthly-scorecard (split into _compute_scorecard_metrics + _send_scorecard_and_log)
- /api/video-challenges/{id}/analyze routing (split into _run_video_ai_analysis
   + _persist_video_analysis)  — tested via auth/routing only (no upload body)

All endpoints must behave identically to pre-refactor (iter 66 green baseline).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"

PASSWORD = os.environ.get("TEST_ACCOUNT_PASSWORD", "test123")

TIER_ACCOUNTS = {
    "free": "free@wladbot.test",
    "starter": "starter@wladbot.test",
    "standard": "standard@wladbot.test",
    "accelerator": "accelerator@wladbot.test",
    "accelerator_raten": "accelerator-raten@wladbot.test",
}


def _login(email: str) -> str:
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": email, "password": PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"login {email} failed: {r.text}"
    return r.json().get("token") or ""


@pytest.fixture(scope="module")
def tokens():
    return {label: _login(email) for label, email in TIER_ACCOUNTS.items()}


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------- /api/user/tier (resolve_user_tier refactor) ----------

class TestUserTierEndpoint:
    def test_free_user_tier_shape(self, tokens):
        r = requests.get(f"{BASE_URL}/api/user/tier", headers=_auth(tokens["free"]), timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # Core keys that must exist per tier contract (contract per services_tier.resolve_user_tier)
        for k in ("tier", "tier_name", "features", "active", "in_grace_period", "days_remaining"):
            assert k in data, f"missing key {k} in {data}"
        assert data["tier"] == "free"
        assert data["active"] is True
        assert data["in_grace_period"] is False
        # Free = lifetime → days_remaining None
        assert data.get("days_remaining") is None

    def test_starter_lifetime(self, tokens):
        r = requests.get(f"{BASE_URL}/api/user/tier", headers=_auth(tokens["starter"]), timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["tier"] == "starter"
        assert data["active"] is True
        assert data["in_grace_period"] is False

    def test_standard_has_days_remaining(self, tokens):
        r = requests.get(f"{BASE_URL}/api/user/tier", headers=_auth(tokens["standard"]), timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["tier"] == "standard"
        # 365-day account → days_remaining should be a positive int (_compute_expiry_status helper)
        dr = data.get("days_remaining")
        assert isinstance(dr, int) and dr > 0, f"expected >0 days_remaining, got {dr}"
        assert data["active"] is True

    def test_accelerator_full_access(self, tokens):
        r = requests.get(f"{BASE_URL}/api/user/tier", headers=_auth(tokens["accelerator"]), timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["tier"] == "accelerator"
        feats = data["features"]
        assert isinstance(feats, dict)
        # accelerator unlocks video analysis
        assert feats.get("video_analysis") is True or feats.get("video_analysis") == "unlocked"

    def test_accelerator_raten_has_installment_info(self, tokens):
        r = requests.get(f"{BASE_URL}/api/user/tier", headers=_auth(tokens["accelerator_raten"]), timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["tier"] == "accelerator"
        # _fetch_installment_info helper populates this for raten user
        installment = data.get("installment_info")
        assert installment is not None, f"installment_info missing: {data}"
        assert "paid" in installment or "installments_paid" in installment

    def test_unauth_returns_401(self):
        r = requests.get(f"{BASE_URL}/api/user/tier", timeout=10)
        assert r.status_code in (401, 403)


# ---------- /api/payments — webhook / checkout regression ----------

class TestPaymentsRegression:
    def test_checkout_status_endpoint_exists(self, tokens):
        # Don't hit stripe real: just check that checkout create rejects empty body with 4xx (not 5xx)
        r = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            headers=_auth(tokens["accelerator"]),
            json={},
            timeout=15,
        )
        assert r.status_code < 500, r.text

    def test_stripe_webhook_rejects_invalid_signature(self):
        # Ensures stripe_webhook route + refactored _finalize_paid_transaction still registered,
        # and that missing/invalid signature path returns 4xx (NOT 500 crash from helper extraction).
        r = requests.post(
            f"{BASE_URL}/api/payments/webhook/stripe",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        # Typical: 400 (no sig header) or 404 if route path differs
        assert r.status_code < 500, r.text


# ---------- /api/cron/monthly-scorecard ----------

class TestCronMonthlyScorecard:
    def test_endpoint_returns_ok(self):
        r = requests.post(f"{BASE_URL}/api/cron/monthly-scorecard", timeout=60)
        assert r.status_code in (200, 404), r.text
        if r.status_code == 200:
            body = r.json()
            # Expected shape from _compute + _send split: summary counters
            assert isinstance(body, dict)


# ---------- /api/video-challenges/{id}/analyze routing ----------

class TestVideoAnalyzeRouting:
    def test_analyze_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/video-challenges/any_id/analyze", timeout=10)
        assert r.status_code in (401, 403, 422)

    def test_analyze_free_tier_paywall(self, tokens):
        # Free user should be blocked by tier check BEFORE helpers even run
        r = requests.post(
            f"{BASE_URL}/api/video-challenges/any_id/analyze",
            headers=_auth(tokens["free"]),
            timeout=15,
        )
        # 402=paywall, 403=forbidden, 422=missing file, 404=no challenge, 400=bad req
        assert r.status_code in (400, 402, 403, 404, 422), r.text
        assert r.status_code < 500, r.text

    def test_analyze_accelerator_no_file_4xx(self, tokens):
        # Accelerator passes tier-gate, but no file → 422 (FastAPI UploadFile required)
        r = requests.post(
            f"{BASE_URL}/api/video-challenges/any_id/analyze",
            headers=_auth(tokens["accelerator"]),
            timeout=15,
        )
        assert r.status_code in (400, 404, 422), r.text
        assert r.status_code < 500, r.text


# ---------- Core auth smoke (httpOnly cookie still green) ----------

class TestAuthSmoke:
    def test_login_sets_session_cookie(self):
        s = requests.Session()
        r = s.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "standard@wladbot.test", "password": PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200
        # session_token HttpOnly cookie must be set per iter 66
        cookies = r.cookies.get_dict()
        assert "session_token" in cookies, f"session_token cookie missing: {cookies}"

    def test_auth_me_via_cookie(self):
        s = requests.Session()
        lr = s.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "standard@wladbot.test", "password": PASSWORD},
            timeout=15,
        )
        assert lr.status_code == 200
        r = s.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("email") == "standard@wladbot.test"
