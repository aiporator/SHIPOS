"""Iteration 56 tests — voice check-in, immersive loaders, email reminders scaffold, xp_info."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
TEST_EMAIL = os.environ.get("TEST_USER_EMAIL", "test@test.com")
TEST_PASSWORD = os.environ.get("TEST_USER_PASSWORD", "test123")


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_token(api_client):
    r = api_client.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_client(api_client, auth_token):
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ============== HEALTH ==============

def test_health(api_client):
    r = api_client.get(f"{BASE_URL}/api/health", timeout=10)
    assert r.status_code == 200


# ============== DAILY CHECK-IN ==============

def test_daily_checkin_text(auth_client):
    r = auth_client.post(
        f"{BASE_URL}/api/daily-checkin",
        json={
            "content": "TEST_56 Heute schwieriges Feedback-Gespräch mit Teammitglied geführt. Habe Wlads Feedbackformel angewendet.",
            "checkin_type": "text",
        },
        timeout=90,
    )
    assert r.status_code == 200, f"Got {r.status_code}: {r.text[:300]}"
    data = r.json()
    assert "checkin_id" in data
    fb = data.get("feedback", {})
    assert "score_delta" in fb
    assert "category" in fb
    assert "micro_tip" in fb
    assert "encouragement" in fb


def test_daily_checkin_voice_type(auth_client):
    """Check that checkin_type='voice' is accepted."""
    r = auth_client.post(
        f"{BASE_URL}/api/daily-checkin",
        json={
            "content": "TEST_56 Eingesprochener Check-in: Habe heute meine 3 Säulen Logos Ethos Pathos in Meeting angewendet.",
            "checkin_type": "voice",
        },
        timeout=90,
    )
    assert r.status_code == 200, f"voice checkin failed: {r.text[:300]}"
    assert "feedback" in r.json()


def test_daily_checkin_list(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/daily-checkin", timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_daily_checkin_today(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/daily-checkin/today", timeout=15)
    assert r.status_code == 200


# ============== VOICE / WHISPER ENDPOINT REACHABILITY ==============

def test_voice_transcribe_requires_auth(api_client):
    # Unauth should fail (401/403)
    clean = requests.Session()
    r = clean.post(f"{BASE_URL}/api/voice/transcribe", timeout=10)
    assert r.status_code in (401, 403, 422), f"Expected auth failure, got {r.status_code}"


def test_voice_transcribe_endpoint_exists(auth_client):
    # Without a file, expect 422 (validation error) — not 404
    r = auth_client.post(f"{BASE_URL}/api/voice/transcribe", timeout=10)
    assert r.status_code != 404, "Voice transcribe endpoint missing"
    assert r.status_code in (400, 422, 500)


# ============== CHALLENGERS ==============

def test_challengers_list(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/challengers", timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) > 0


def test_challenger_start_and_message(auth_client):
    lst = auth_client.get(f"{BASE_URL}/api/challengers", timeout=15).json()
    cid = lst[0].get("challenger_id") or lst[0].get("id")
    assert cid, "No challenger id found"

    r1 = auth_client.post(f"{BASE_URL}/api/challengers/{cid}/start", timeout=60)
    assert r1.status_code == 200, f"start failed {r1.status_code}: {r1.text[:200]}"
    start_data = r1.json()
    challenge_id = start_data.get("challenge_id")
    assert challenge_id, f"No challenge_id in start response: {start_data}"

    r2 = auth_client.post(
        f"{BASE_URL}/api/challengers/{cid}/message",
        json={"challenge_id": challenge_id, "message": "TEST_56 Ich gehe strukturiert vor mit Feedbackformel."},
        timeout=120,
    )
    assert r2.status_code == 200, f"message failed {r2.status_code}: {r2.text[:200]}"


# ============== CHALLENGE30 QUIZ ==============

def test_challenge30_quiz_submit(auth_client):
    # QuizSubmission expects answers as dict (keyed by question index)
    r = auth_client.post(
        f"{BASE_URL}/api/challenge30/quiz/1",
        json={"answers": {"0": 0, "1": 1, "2": 0, "3": 1, "4": 0}},
        timeout=30,
    )
    assert r.status_code in (200, 402, 404), f"Unexpected {r.status_code}: {r.text[:200]}"


# ============== EMAIL REMINDERS ==============

def test_email_reminders_status(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/email-reminders-status", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "enabled" in data
    assert data["enabled"] is False  # RESEND_API_KEY intentionally empty


def test_cron_event_reminders(api_client):
    # Public endpoint
    r = api_client.post(f"{BASE_URL}/api/cron/event-reminders", timeout=30)
    assert r.status_code == 200, f"cron failed: {r.text[:200]}"
    data = r.json()
    assert "24h" in data
    assert "1h" in data
    assert "enabled" in data
    assert data["enabled"] is False


def test_send_test_reminder_when_disabled(auth_client):
    # Get an event
    events = auth_client.get(f"{BASE_URL}/api/events", timeout=15).json()
    assert len(events) > 0
    eid = events[0]["event_id"]
    r = auth_client.post(f"{BASE_URL}/api/events/{eid}/send-test-reminder", timeout=15)
    assert r.status_code == 503, f"Expected 503 when disabled, got {r.status_code}: {r.text[:200]}"


# ============== DASHBOARD XP_INFO ==============

def test_dashboard_has_xp_info(auth_client):
    # Frontend uses /api/dashboard-v4 which is the source of xp_info
    r = auth_client.get(f"{BASE_URL}/api/dashboard-v4", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "xp_info" in data, f"Missing xp_info. Keys: {list(data.keys())}"
    xi = data["xp_info"]
    expected = [
        "xp", "level", "level_index", "level_label_de", "level_label_en",
        "progress_pct", "next_level", "xp_to_next",
    ]
    for k in expected:
        assert k in xi, f"xp_info missing '{k}'. Got: {list(xi.keys())}"


def test_xp_info_endpoint(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/xp-info", timeout=10)
    assert r.status_code == 200
    xi = r.json()
    for k in ["xp", "level", "level_index", "level_label_de", "level_label_en",
              "progress_pct", "next_level", "xp_to_next"]:
        assert k in xi, f"xp-info missing '{k}'"
