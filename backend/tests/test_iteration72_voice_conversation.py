"""Iter 72 — Voice Conversation Audio-Mode endpoint tests.

Tests POST /api/voice/conversation auth, validation, and persona registry.
We don't synthesize a real .webm audio file — we test:
- 401 without auth cookie/token
- 400 invalid persona (with auth)
- 400 empty audio file (with auth)
- /api/voice/personas still lists wlad + 8 challengers
"""
import os
import io
import pytest
import requests

def _load_url():
    url = os.environ.get('REACT_APP_BACKEND_URL', '').strip()
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


BASE_URL = _load_url()
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session_with_auth():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": "standard@wladbot.test", "password": "test123"}, timeout=15)
    if r.status_code != 200:
        r2 = s.post(f"{API}/auth/login", json={"email": "test@test.com", "password": "test123"}, timeout=15)
        if r2.status_code != 200:
            pytest.skip(f"login failed: standard={r.status_code} {r.text[:200]} | legacy={r2.status_code} {r2.text[:200]}")
    return s


@pytest.fixture(scope="module")
def anon_session():
    return requests.Session()


# ── /api/voice/personas — public list ───────────────────────────────────────
class TestPersonas:
    def test_personas_returns_200_and_full_registry(self, anon_session):
        r = anon_session.get(f"{API}/voice/personas", timeout=10)
        assert r.status_code == 200, f"expected 200, got {r.status_code}: {r.text[:200]}"
        data = r.json()
        assert "personas" in data
        assert "model" in data
        keys = {p["persona"] for p in data["personas"]}
        expected = {"wlad", "bezos", "musk", "oprah", "jobs", "branson", "sandberg", "page", "hastings"}
        assert expected.issubset(keys), f"missing personas: {expected - keys}"
        # wlad must be present with name
        wlad = next(p for p in data["personas"] if p["persona"] == "wlad")
        assert "Wlad" in wlad["name"]


# ── /api/voice/conversation — auth + validation ─────────────────────────────
class TestVoiceConversationAuth:
    def test_no_auth_returns_401(self, anon_session):
        files = {"file": ("voice.webm", io.BytesIO(b"\x1a\x45\xdf\xa3"), "audio/webm")}
        data = {"persona": "wlad"}
        r = anon_session.post(f"{API}/voice/conversation", files=files, data=data, timeout=15)
        assert r.status_code == 401, f"expected 401 without auth, got {r.status_code}: {r.text[:200]}"

    def test_invalid_persona_returns_400(self, session_with_auth):
        files = {"file": ("voice.webm", io.BytesIO(b"\x1a\x45\xdf\xa3"), "audio/webm")}
        data = {"persona": "darth_vader"}
        r = session_with_auth.post(f"{API}/voice/conversation", files=files, data=data, timeout=15)
        # Should hit unknown-persona check (400) before file/credit/transcribe paths
        assert r.status_code == 400, f"expected 400 for invalid persona, got {r.status_code}: {r.text[:300]}"
        body = r.json()
        detail = (body.get("detail") or "").lower()
        assert "unknown persona" in detail or "darth_vader" in detail, f"unexpected detail: {body}"

    def test_empty_audio_returns_400_or_402(self, session_with_auth):
        files = {"file": ("voice.webm", io.BytesIO(b""), "audio/webm")}
        data = {"persona": "wlad"}
        r = session_with_auth.post(f"{API}/voice/conversation", files=files, data=data, timeout=15)
        # 400 for empty audio is the documented contract; 402 acceptable if user is out of credits.
        assert r.status_code in (400, 402), f"expected 400 or 402 for empty audio, got {r.status_code}: {r.text[:300]}"
        if r.status_code == 400:
            body = r.json()
            detail = (body.get("detail") or "").lower()
            assert "empty" in detail or "audio" in detail, f"unexpected detail: {body}"

    def test_endpoint_exists_in_openapi(self, anon_session):
        r = anon_session.get(f"{API}/openapi.json", timeout=10)
        if r.status_code != 200:
            pytest.skip("openapi not available")
        spec = r.json()
        paths = spec.get("paths", {})
        assert "/api/voice/conversation" in paths, "voice/conversation route missing from OpenAPI"
        assert "post" in paths["/api/voice/conversation"]
