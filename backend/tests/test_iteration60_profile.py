"""Iter 60 — Profile endpoints + regression for existing APIs."""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
TIERS = ["free", "starter", "standard", "accelerator"]


def login(email: str) -> str:
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "test123"})
    assert r.status_code == 200, f"login failed {email}: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def tokens():
    return {t: login(f"{t}@wladbot.test") for t in TIERS}


# ── GET /api/profile/me for all 4 tiers ──
@pytest.mark.parametrize("tier", TIERS)
def test_profile_me_all_tiers(tokens, tier):
    t = tokens[tier]
    r = requests.get(f"{BASE_URL}/api/profile/me", headers={"Authorization": f"Bearer {t}"})
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ["user_id", "name", "tier", "level", "xp", "leadership_score", "eq_score",
              "communication_score", "streak", "member_since", "stats"]:
        assert k in d, f"missing {k}"
    assert d["tier"] == tier if tier != "free" else d["tier"] in ("free",)
    stats_keys = {"simulations", "chat_sessions", "challenge_days_completed", "referrals", "community_posts"}
    assert stats_keys.issubset(d["stats"].keys())


# ── PATCH /api/profile/me: partial update (bio only) + persistence ──
def test_profile_patch_partial_bio_persistence(tokens):
    t = tokens["standard"]
    h = {"Authorization": f"Bearer {t}"}
    # patch
    r = requests.patch(f"{BASE_URL}/api/profile/me", json={"bio": "TEST_My leadership motto"}, headers=h)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["updated"] >= 1
    assert "bio" in body["fields"]
    # verify via GET
    r2 = requests.get(f"{BASE_URL}/api/profile/me", headers=h)
    assert r2.status_code == 200
    assert r2.json().get("bio") == "TEST_My leadership motto"


def test_profile_patch_multi_fields(tokens):
    t = tokens["accelerator"]
    h = {"Authorization": f"Bearer {t}"}
    r = requests.patch(f"{BASE_URL}/api/profile/me",
                       json={"position": "TEST_CTO", "company": "TEST_AcmeAI", "industry": "SaaS"}, headers=h)
    assert r.status_code == 200
    assert r.json()["updated"] == 3
    r2 = requests.get(f"{BASE_URL}/api/profile/me", headers=h).json()
    assert r2["position"] == "TEST_CTO"
    assert r2["company"] == "TEST_AcmeAI"
    assert r2["industry"] == "SaaS"


# ── GET /api/profile/activity ──
def test_profile_activity_de(tokens):
    t = tokens["accelerator"]
    r = requests.get(f"{BASE_URL}/api/profile/activity?limit=20&lang=de",
                     headers={"Authorization": f"Bearer {t}"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert "activities" in d and "total" in d and "xp_last_30d" in d
    assert isinstance(d["activities"], list)
    for a in d["activities"]:
        for k in ["activity_id", "action", "label", "icon", "xp_color", "xp_delta", "created_at"]:
            assert k in a


def test_profile_activity_en_labels_differ(tokens):
    """EN labels should differ from DE for at least 1 known action."""
    t = tokens["accelerator"]
    h = {"Authorization": f"Bearer {t}"}
    de = requests.get(f"{BASE_URL}/api/profile/activity?limit=30&lang=de", headers=h).json()
    en = requests.get(f"{BASE_URL}/api/profile/activity?limit=30&lang=en", headers=h).json()
    # If no activities, skip
    if not de["activities"] or not en["activities"]:
        pytest.skip("no activities")
    # find a known action to compare
    known = {"daily_checkin", "challenge_day", "community_post", "chat_session", "simulation"}
    for a_de, a_en in zip(de["activities"], en["activities"]):
        if a_de["action"] in known:
            assert a_de["label"] != a_en["label"], f"labels identical for {a_de['action']}"
            return
    pytest.skip("no known action to compare")


# ── POST /api/upload/profile-picture (regression) ──
def test_profile_picture_upload(tokens):
    t = tokens["starter"]
    # 1×1 PNG
    png = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
           b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0"
           b"\x00\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb0\x00\x00\x00\x00IEND\xaeB`\x82")
    files = {"file": ("test.png", io.BytesIO(png), "image/png")}
    r = requests.post(f"{BASE_URL}/api/upload/profile-picture",
                      files=files, headers={"Authorization": f"Bearer {t}"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert "path" in d
    assert "size" in d


# ── Regression: data flow — community post appears in activity ──
def test_community_post_appears_in_activity(tokens):
    t = tokens["standard"]
    h = {"Authorization": f"Bearer {t}"}
    payload = {"content": "TEST_iter60 leadership insight", "category": "insight"}
    r = requests.post(f"{BASE_URL}/api/community/posts", json=payload, headers=h)
    assert r.status_code in (200, 201), r.text
    # fetch activity
    act = requests.get(f"{BASE_URL}/api/profile/activity?limit=5&lang=de", headers=h).json()
    actions = [a["action"] for a in act["activities"]]
    assert "community_post" in actions, f"community_post missing in {actions}"


# ── Regression: 6 existing endpoints still work ──
def test_regression_existing_endpoints(tokens):
    t = tokens["accelerator"]
    h = {"Authorization": f"Bearer {t}"}
    endpoints = [
        ("/api/my-path/videos", "GET"),
        ("/api/dashboard-v4", "GET"),
        ("/api/wladhub/3layer", "GET"),
        ("/api/community/feed", "GET"),
        ("/api/referral/code", "GET"),
    ]
    for path, _ in endpoints:
        r = requests.get(f"{BASE_URL}{path}", headers=h)
        assert r.status_code == 200, f"{path} -> {r.status_code}: {r.text[:200]}"


def test_regression_enterprise_submit():
    t = login("free@wladbot.test")
    r = requests.post(f"{BASE_URL}/api/enterprise/submit",
                      json={"company": "TEST_Co", "name": "TEST", "email": "t@t.co", "teamSize": "10", "lang": "de"},
                      headers={"Authorization": f"Bearer {t}"})
    assert r.status_code in (200, 201), r.text
