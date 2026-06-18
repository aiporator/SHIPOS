"""Tests for services_actions.record_user_action() central registry."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
TEST_PASSWORD = os.environ.get("TEST_USER_PASSWORD", "test123")
TEST_EMAIL = "standard@wladbot.test"


@pytest.fixture(scope="module")
def token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()["token"]


def _headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def test_registry_contract():
    """Every ACTION_REWARDS key must also exist in ACTION_META (profile.py)."""
    from services_actions import ACTION_REWARDS
    from routes.profile import ACTION_META
    missing = set(ACTION_REWARDS.keys()) - set(ACTION_META.keys())
    # community_post was the bug — it MUST be in both
    assert "community_post" in ACTION_REWARDS
    assert "community_post" in ACTION_META
    # It's OK for ACTION_META to have extra entries (e.g. level_up which isn't a user-initiated action)
    # But every reward-giving action must have UI metadata:
    known_unmapped = {"register", "wladhub_sync"}  # technical actions, not shown in feed
    truly_missing = missing - known_unmapped
    assert not truly_missing, f"Actions in ACTION_REWARDS but missing UI metadata: {truly_missing}"


def test_community_post_records_activity(token):
    """End-to-end: POST community post → activity feed shows it with correct XP."""
    # Baseline
    before = requests.get(
        f"{BASE_URL}/api/profile/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    ).json()
    xp_before = before["xp"]

    # Create post
    create = requests.post(
        f"{BASE_URL}/api/community/posts",
        headers=_headers(token),
        json={"content": f"pytest record_user_action test ({xp_before})", "category": "win"},
        timeout=10,
    )
    assert create.status_code == 200
    post_id = create.json()["post_id"]

    # Activity feed should show it first
    feed = requests.get(
        f"{BASE_URL}/api/profile/activity?limit=3",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    ).json()
    top = feed["activities"][0]
    assert top["action"] == "community_post"
    assert top["xp_delta"] == 10
    assert top["metadata"]["post_id"] == post_id

    # XP increased by exactly 10
    after = requests.get(
        f"{BASE_URL}/api/profile/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    ).json()
    assert after["xp"] == xp_before + 10


def test_unknown_action_warns_but_doesnt_crash():
    """record_user_action with unknown key should log warning + apply 0 reward."""
    from services_actions import record_user_action, ACTION_REWARDS
    assert "totally_fake_action_xyz" not in ACTION_REWARDS

    # This is an async function — run it synchronously for the test
    import asyncio
    # Use the standard user id
    user_doc = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=10,
    ).json()["user"]
    user_id = user_doc["user_id"]

    result = asyncio.run(record_user_action(user_id, "totally_fake_action_xyz"))
    assert result["action"] == "totally_fake_action_xyz"
    assert result["xp"] == 0  # no reward for unknown action


# ── Migration regression tests (Iter 62) ────────────────────────────────────

def test_task_completion_records_activity():
    """tasks.py migration: completing a task awards +10 XP and logs activity."""
    # Login fresh (separate user to avoid XP interference)
    login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "starter@wladbot.test", "password": TEST_PASSWORD},
        timeout=10,
    )
    token = login.json()["token"]
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    before = requests.get(f"{BASE_URL}/api/profile/me", headers=h, timeout=10).json()["xp"]

    # Create + complete task
    create = requests.post(f"{BASE_URL}/api/tasks", json={"title": "pytest e2e task"}, headers=h, timeout=10)
    assert create.status_code == 200
    tid = create.json()["task_id"]

    put = requests.put(f"{BASE_URL}/api/tasks/{tid}", json={"status": "completed"}, headers=h, timeout=10)
    assert put.status_code == 200
    assert put.json()["status"] == "completed"

    # Activity feed shows task_completed as most recent
    feed = requests.get(f"{BASE_URL}/api/profile/activity?limit=2", headers=h, timeout=10).json()
    assert feed["activities"][0]["action"] == "task_completed"
    assert feed["activities"][0]["xp_delta"] == 10

    after = requests.get(f"{BASE_URL}/api/profile/me", headers=h, timeout=10).json()["xp"]
    # leadership_delta=2 may trigger extra scoring boost, so use ">=" — core contract is XP was awarded
    assert after >= before + 10


def test_registry_covers_all_route_actions():
    """All action keys used in production routes must exist in ACTION_REWARDS."""
    from services_actions import ACTION_REWARDS

    # Actions actually raised by migrated routes (scanned from code as of Iter 62).
    # If a new action appears in a route, add it here AND to ACTION_REWARDS + ACTION_META.
    production_actions = {
        "register", "onboarding_completed",
        "daily_checkin", "chat_message",
        "community_post",
        "mission_completed", "playbook_completed", "playbook_step",
        "report_generated", "tool_used", "deep_assist",
        "challenge30_day", "challenge30_quiz",
        "challenge_completed", "video_challenge_completed", "simulation_completed",
        "task_completed",
        "referral_success", "referral_used", "social_share",
        "enterprise_lead", "enterprise_diagnosis",
        "wladhub_sync", "wladhub_diagnosis_imported", "wladhub_supabase_synced",
    }
    missing = production_actions - set(ACTION_REWARDS.keys())
    assert not missing, f"Production uses these actions but ACTION_REWARDS is missing them: {missing}"
