"""Iteration 57 — Tier system, packages, video-analysis gate, installments."""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://command-center-229.preview.emergentagent.com").rstrip("/")
TEST_EMAIL = os.environ.get("TEST_EMAIL", "test@test.com")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "test123")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Auth failed: {r.status_code} {r.text}")
    token = r.json().get("token") or r.json().get("access_token")
    if not token:
        pytest.skip(f"No token in: {r.json()}")
    return token


@pytest.fixture(scope="module")
def auth_session(api, auth):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {auth}"})
    return s


# ── Packages ──────────────────────────────────────────────────────────────────

class TestPackages:
    def test_packages_returns_5_with_tier_and_billing(self, api):
        r = api.get(f"{BASE_URL}/api/payments/packages")
        assert r.status_code == 200
        pkgs = r.json()
        assert isinstance(pkgs, list)
        ids = {p["id"] for p in pkgs}
        expected = {"starter", "standard", "accelerator", "accelerator_installment", "enterprise"}
        assert expected.issubset(ids), f"Missing packages: {expected - ids}"
        for p in pkgs:
            assert "tier" in p and p["tier"] in ("starter", "standard", "accelerator")
            assert "billing" in p
            assert "amount" in p
        # verify accelerator_installment specifics
        ai = next(p for p in pkgs if p["id"] == "accelerator_installment")
        assert ai["billing"] == "installment"
        assert abs(ai["amount"] - 580.83) < 0.01
        assert ai["tier"] == "accelerator"
        assert ai.get("installments_total") == 12


# ── Tier matrix ───────────────────────────────────────────────────────────────

class TestTierMatrix:
    def test_tiers_returns_4_with_features(self, api):
        r = api.get(f"{BASE_URL}/api/payments/tiers")
        assert r.status_code == 200
        tiers = r.json()
        ids = {t["id"] for t in tiers}
        assert {"free", "starter", "standard", "accelerator"}.issubset(ids)

    def test_video_analysis_only_for_accelerator(self, api):
        r = api.get(f"{BASE_URL}/api/payments/tiers")
        tiers = {t["id"]: t for t in r.json()}
        assert tiers["free"]["features"]["video_analysis"] is False
        assert tiers["starter"]["features"]["video_analysis"] is False
        assert tiers["standard"]["features"]["video_analysis"] is False
        assert tiers["accelerator"]["features"]["video_analysis"] is True


# ── User tier endpoint ───────────────────────────────────────────────────────

class TestUserTier:
    def test_user_tier_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/user/tier")
        assert r.status_code in (401, 403)

    def test_user_tier_returns_resolved_info(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/user/tier")
        assert r.status_code == 200, r.text
        data = r.json()
        for k in ("tier", "tier_name", "active", "in_grace_period", "badge_color", "features"):
            assert k in data, f"missing {k}"
        # Test user is intentionally free
        assert data["tier"] in ("free", "starter", "standard", "accelerator")
        assert isinstance(data["features"], dict)
        assert "video_analysis" in data["features"]


# ── Video analysis gate ───────────────────────────────────────────────────────

class TestVideoGate:
    def test_video_analyze_returns_402_for_free_user(self, auth):
        # Use a multipart upload (route requires file=File(...))
        files = {"file": ("test.webm", io.BytesIO(b"fake-bytes"), "audio/webm")}
        headers = {"Authorization": f"Bearer {auth}"}
        r = requests.post(
            f"{BASE_URL}/api/video-challenges/dummy_id/analyze",
            files=files, headers=headers, timeout=30,
        )
        assert r.status_code == 402, f"Expected 402 got {r.status_code}: {r.text}"
        body = r.json()
        detail = body.get("detail", body)
        assert isinstance(detail, dict)
        assert detail.get("error") == "tier_required"
        assert detail.get("feature") == "video_analysis"
        assert detail.get("required_tier") == "accelerator"


# ── Checkout (installment) ────────────────────────────────────────────────────

class TestCheckoutInstallment:
    def test_checkout_accelerator_installment_creates_session(self, auth_session):
        payload = {"package_id": "accelerator_installment", "origin_url": BASE_URL}
        r = auth_session.post(f"{BASE_URL}/api/payments/checkout", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("http")
        assert "session_id" in data and len(data["session_id"]) > 5


# ── Installment next ──────────────────────────────────────────────────────────

class TestInstallmentNext:
    def test_installment_next_404_without_active_plan(self, auth_session):
        payload = {"package_id": "accelerator_installment", "origin_url": BASE_URL}
        r = auth_session.post(f"{BASE_URL}/api/payments/installment/next", json=payload, timeout=30)
        # User is free → no active plan → 404
        assert r.status_code == 404, r.text
        body = r.json()
        detail = body.get("detail", "")
        assert "Kein aktiver" in str(detail) or "Ratenzahlungs" in str(detail)


# ── Cron installments due ────────────────────────────────────────────────────

class TestCronInstallments:
    def test_cron_installments_due_runs(self, api):
        r = api.post(f"{BASE_URL}/api/cron/installments-due", timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "sent" in body
        assert isinstance(body["sent"], int)
