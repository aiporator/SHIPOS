"""Iter 89 pre-launch E2E backend smoke tests.

Targets the JSON-parsing fixes for AI-driven endpoints and the new
Iter 89 routes (video archive, leader-diagnose, OG image, video-trial bonus).

All tests use the production preview URL from REACT_APP_BACKEND_URL.
"""
from __future__ import annotations

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "test123"

REQUEST_TIMEOUT = 90  # GPT-5.2 can be slow


@pytest.fixture(scope="session")
def auth_token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=REQUEST_TIMEOUT,
    )
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code}: {r.text[:200]}")
    tok = r.json().get("token")
    if not tok:
        pytest.skip("no token in login response")
    return tok


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ---------- Health / housekeeping ----------

class TestHealth:
    def test_health_200(self):
        r = requests.get(f"{BASE_URL}/api/health", timeout=30)
        assert r.status_code == 200

    def test_stripe_webhook_410(self):
        r = requests.post(f"{BASE_URL}/api/webhook/stripe", json={}, timeout=30)
        assert r.status_code == 410, f"expected 410 Gone, got {r.status_code}: {r.text[:200]}"

    def test_internal_sync_health_with_secret(self):
        secret = None
        env_path = "/app/backend/.env"
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.startswith("INBOUND_SYNC_SECRET"):
                        secret = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
        if not secret:
            pytest.skip("INBOUND_SYNC_SECRET not set in backend/.env")
        r = requests.get(
            f"{BASE_URL}/api/internal/sync/health",
            headers={"X-Sync-Secret": secret},
            timeout=30,
        )
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:200]}"


# ---------- AI Tools (JSON parse fix) ----------

TOOL_INPUTS = {
    "conversation-prep": "Ich muss morgen ein schwieriges Feedback-Gespräch mit einem Teammitglied führen, das wiederholt Deadlines verpasst hat. Ich brauche einen klaren Gesprächsplan.",
    "email-optimizer": "Hallo Team, ich wollte fragen ob ihr vielleicht eventuell den Bericht bis Freitag fertig bekommen könntet. Wäre das ok?",
    "decision-maker": "Soll ich einen externen Berater einstellen oder die Aufgabe intern lösen? Budget ist knapp.",
    "meeting-builder": "Quartalsreview mit 8 Personen, 60 Minuten, Fokus auf Q4-Strategie und Budget-Allokation.",
    "performance-analysis": "Mitarbeiter A: erreicht 80% der KPIs, hohes Engagement. Mitarbeiter B: 110% KPIs aber Team-Konflikte. Mitarbeiter C: 60% KPIs, neue Rolle seit 2 Monaten.",
}


@pytest.mark.parametrize("tool_id,user_input", list(TOOL_INPUTS.items()))
def test_tools_return_structured_dict(auth_headers, tool_id, user_input):
    r = requests.post(
        f"{BASE_URL}/api/tools/{tool_id}",
        headers=auth_headers,
        json={"input": user_input},
        timeout=REQUEST_TIMEOUT,
    )
    assert r.status_code == 200, f"{tool_id}: {r.status_code} {r.text[:300]}"
    data = r.json()
    result = data.get("result")
    assert isinstance(result, dict), f"{tool_id}: result is not dict — {type(result).__name__}: {str(result)[:200]}"
    assert not result.get("format_error"), f"{tool_id}: format_error=true — raw={str(result.get('raw_text',''))[:200]}"
    # Must have at least 2 keys = structured response, not single bucket
    assert len(result.keys()) >= 2, f"{tool_id}: result has only {len(result.keys())} key(s): {list(result.keys())}"


# ---------- Checkin ----------

class TestCheckin:
    def test_checkin_returns_structured_feedback(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/daily-checkin",
            headers=auth_headers,
            json={
                "content": "Heute hatte ich ein klares 1:1 Gespräch und das Team-Meeting lief produktiv. Schwierige Entscheidung über Budget-Kürzung steht an. Ich merke, dass ich klarer kommunizieren muss bei unangenehmen Themen.",
                "checkin_type": "evening",
            },
            timeout=REQUEST_TIMEOUT,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        ai_fb = data.get("feedback") or data.get("ai_feedback")
        assert isinstance(ai_fb, dict), f"feedback not dict: {type(ai_fb).__name__} — {str(ai_fb)[:200]}"
        assert not ai_fb.get("format_error"), f"format_error=true: {str(ai_fb.get('raw_text',''))[:200]}"


# ---------- Chat ----------

class TestChat:
    def test_chat_returns_structured_parsed(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/chat",
            headers=auth_headers,
            json={"message": "Wie führe ich ein schwieriges Gespräch mit meinem Vorgesetzten über mehr Verantwortung?"},
            timeout=REQUEST_TIMEOUT,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        parsed = data.get("parsed")
        # parsed may be None for non-structured chat — but if present, must be dict
        if parsed is not None:
            assert isinstance(parsed, dict), f"parsed not dict: {type(parsed).__name__}"
            assert not parsed.get("format_error")
        # response/answer field must exist
        assert any(k in data for k in ("response", "answer", "message", "parsed")), f"keys={list(data.keys())}"


# ---------- Iter 89 new endpoints ----------

class TestIter89Endpoints:
    def test_video_archive(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/video-archive", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        # Accept either bare list or {attempts: [...]}
        if isinstance(data, dict):
            attempts = data.get("attempts") or data.get("results") or data.get("items")
            assert attempts is not None or "total" in data, f"unexpected shape: {list(data.keys())}"
        else:
            assert isinstance(data, list)

    def test_wladhub_diagnosis(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/wladhub/diagnosis", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert isinstance(data, dict)
        # Should be either {connected: false} or actual diagnosis
        assert "connected" in data or "diagnosis" in data or "data" in data or len(data) > 0

    def test_wladhub_3layer(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/wladhub/3layer", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert isinstance(data, dict)
        # scores or layers expected
        assert "scores" in data or "layers" in data or "connected" in data, f"keys={list(data.keys())}"

    def test_og_leader_score_preview(self):
        r = requests.get(f"{BASE_URL}/api/og/leader-score/preview/85", timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        ct = r.headers.get("content-type", "")
        assert "image/png" in ct, f"content-type={ct}"
        # PNG magic header
        assert r.content[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
        assert len(r.content) > 1000, f"PNG too small: {len(r.content)} bytes"

    def test_video_trial_status_bonus_fields(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/user/video-trial-status", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        for key in ("bonus", "base_total", "total"):
            assert key in data, f"missing key '{key}'. keys={list(data.keys())}"
        # total = base_total + bonus (sanity)
        try:
            assert data["total"] == data["base_total"] + data["bonus"], (
                f"total({data['total']}) != base_total({data['base_total']}) + bonus({data['bonus']})"
            )
        except TypeError:
            pytest.fail(f"non-numeric fields: {data}")
