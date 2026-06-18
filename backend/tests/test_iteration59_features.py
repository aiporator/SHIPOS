"""Iteration 59 tests — admin refactor regression, payments refactor + new group coaching packages,
monthly scorecard cron, my-path videos, wladhub 3-layer.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://command-center-229.preview.emergentagent.com").rstrip("/")
PASSWORD = os.environ.get("TEST_USER_PASSWORD", "test123")


def _login(email: str) -> str:
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def tokens():
    return {
        "free": _login("free@wladbot.test"),
        "starter": _login("starter@wladbot.test"),
        "standard": _login("standard@wladbot.test"),
        "accelerator": _login("accelerator@wladbot.test"),
        "accelerator_raten": _login("accelerator-raten@wladbot.test"),
        "admin": _login("test@test.com"),
    }


def _hdr(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── my-path videos: regression per-tier unlock counts ─────────────────────

@pytest.mark.parametrize("tier,expected_unlocked", [
    ("free", 0),
    ("starter", 6),
    ("standard", 6),
    ("accelerator", 10),
])
def test_my_path_videos_tier(tokens, tier, expected_unlocked):
    r = requests.get(f"{BASE_URL}/api/my-path/videos", headers=_hdr(tokens[tier]), timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    videos = (data.get("starter_videos", []) or []) + (data.get("accelerator_videos", []) or [])
    assert len(videos) == 10, f"expected 10 videos, got {len(videos)} (keys={list(data.keys())})"
    unlocked = data.get("unlocked_count", sum(1 for v in videos if v.get("unlocked") is True))
    assert unlocked == expected_unlocked, f"{tier}: expected {expected_unlocked} unlocked, got {unlocked}"


# ── wladhub 3layer regression ─────────────────────────────────────────────

@pytest.mark.parametrize("tier", ["starter", "standard", "accelerator"])
def test_wladhub_3layer(tokens, tier):
    r = requests.get(f"{BASE_URL}/api/wladhub/3layer", headers=_hdr(tokens[tier]), timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "overall_score" in d, f"missing overall_score: {list(d.keys())}"
    # 3 score bars (new helper _derive_scores_from_activity)
    for k in ("ki_kompetenz", "boardroom_rhetorik", "strategisches_eq"):
        assert k in d, f"missing score {k}: {list(d.keys())}"
        assert isinstance(d[k], (int, float)) and 0 <= d[k] <= 100
    assert "strengths" in d and isinstance(d["strengths"], list)
    assert "improvements" in d and isinstance(d["improvements"], list)


# ── admin overview regression ─────────────────────────────────────────────

def test_admin_overview_structure(tokens):
    r = requests.get(f"{BASE_URL}/api/admin/overview", headers=_hdr(tokens["admin"]), timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    for key in ("users", "tier_distribution", "revenue", "installments", "community", "enterprise_leads", "referrals"):
        assert key in d, f"missing key {key} in admin overview"
    # user stats shape
    assert "total" in d["users"] and "new_30d" in d["users"] and "new_7d" in d["users"]
    # revenue shape
    assert "total_eur" in d["revenue"] and "per_tier" in d["revenue"]
    # tier distribution includes the 4 tiers
    for t in ("free", "starter", "standard", "accelerator"):
        assert t in d["tier_distribution"]


def test_admin_overview_forbidden_for_non_admin(tokens):
    r = requests.get(f"{BASE_URL}/api/admin/overview", headers=_hdr(tokens["starter"]), timeout=30)
    assert r.status_code == 403


# ── payments packages: new group coaching add-ons ────────────────────────

def test_packages_contain_group_coaching():
    r = requests.get(f"{BASE_URL}/api/payments/packages", timeout=30)
    assert r.status_code == 200
    pkgs = r.json()
    ids = {p["id"] for p in pkgs}
    assert "group_coaching_monthly" in ids
    assert "group_coaching_annual" in ids
    # Verify amounts
    m = next(p for p in pkgs if p["id"] == "group_coaching_monthly")
    a = next(p for p in pkgs if p["id"] == "group_coaching_annual")
    assert m["amount"] == 49.00
    assert a["amount"] == 299.00


@pytest.mark.parametrize("pkg_id", ["group_coaching_monthly", "group_coaching_annual"])
def test_checkout_group_coaching(tokens, pkg_id):
    payload = {"package_id": pkg_id, "origin_url": "https://command-center-229.preview.emergentagent.com"}
    r = requests.post(f"{BASE_URL}/api/payments/checkout", headers=_hdr(tokens["accelerator"]),
                      json=payload, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "url" in d and d["url"].startswith("https://")
    assert "session_id" in d and d["session_id"]


# ── cron/installments-due regression ─────────────────────────────────────

def test_cron_installments_due():
    r = requests.post(f"{BASE_URL}/api/cron/installments-due", timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "sent" in d
    assert "scanned" in d


# ── cron/monthly-scorecard (new, public, idempotent) ─────────────────────

def test_cron_monthly_scorecard_idempotent():
    # First, ensure clean slate: delete this month's email_log entries
    # We cannot access DB directly, so just call twice and verify second returns 0
    r1 = requests.post(f"{BASE_URL}/api/cron/monthly-scorecard", timeout=60)
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert "sent" in d1 and "scanned" in d1 and "month" in d1
    # scanned should be >= 2 (2 accelerator seeded users)
    assert d1["scanned"] >= 2, f"expected >=2 accelerator users, got {d1['scanned']}"

    # Second call — should be 0 due to email_log dedup
    r2 = requests.post(f"{BASE_URL}/api/cron/monthly-scorecard", timeout=60)
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["sent"] == 0, f"second call should dedupe, got sent={d2['sent']}"
    assert d2["month"] == d1["month"]
