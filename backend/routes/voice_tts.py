"""ElevenLabs Voice Integration — WladBot motivational voice + 8 Challengers persona voices.

Strategy:
- Each persona maps to an ElevenLabs pre-made voice_id that matches the vibe (personality, gender, tone).
- Actual voice cloning of real celebrities is NOT legal/ethical, so we pick curated voices from
  ElevenLabs' public library that sound appropriate for each character.
- MongoDB cache (voice_cache collection) deduplicates identical text+voice requests to save API costs.
- Audio returned as base64 data-URL for inline <audio> playback — no file storage needed.
"""
from __future__ import annotations
import os
import base64
import hashlib
import tempfile
import uuid
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel, Field

from config import db, logger, EMERGENT_LLM_KEY
from services import get_current_user, get_user_memory
from services_actions import record_user_action
from routes.admin import require_admin

router = APIRouter(prefix="/api/voice", tags=["voice"])


# ── ElevenLabs Client (lazy init) ────────────────────────────────────────────
_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("ELEVENLABS_API_KEY")
        if not api_key:
            raise HTTPException(status_code=503, detail="ElevenLabs not configured")
        from elevenlabs.client import ElevenLabs
        _client = ElevenLabs(api_key=api_key)
    return _client


def _reset_client() -> None:
    """Invalidate the cached client — called on 401 so the next request re-reads
    ELEVENLABS_API_KEY from env (supports key rotation without pod restart)."""
    global _client
    _client = None


# ── Persona → Voice Registry ────────────────────────────────────────────────
# Voice IDs from ElevenLabs public library — curated to match each persona's tone.
# Users can later override these per-persona via admin endpoint (future feature).
VOICE_REGISTRY: dict[str, dict] = {
    # Motivational German coach (the heart of the app)
    "wlad": {
        "voice_id": "pNInz6obpgDQGcFmaJgB",  # "Adam" — deep, confident male
        "name": "Wlad Jachtchenko",
        "stability": 0.55, "similarity_boost": 0.75, "style": 0.40,
        "language": "de",
    },
    # 8 Challengers
    "bezos": {
        "voice_id": "TX3LPaxmHKxFdv7VOQHJ",  # "Liam" — calm, commanding male
        "name": "Jeff Bezos", "stability": 0.60, "similarity_boost": 0.70, "style": 0.25, "language": "de",
    },
    "musk": {
        "voice_id": "onwK4e9ZLuTAKqWW03F9",  # "Daniel" — slightly nerdy, precise male
        "name": "Elon Musk", "stability": 0.45, "similarity_boost": 0.75, "style": 0.55, "language": "de",
    },
    "oprah": {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",  # "Bella" — warm, empathic female
        "name": "Oprah Winfrey", "stability": 0.65, "similarity_boost": 0.80, "style": 0.50, "language": "de",
    },
    "jobs": {
        "voice_id": "ErXwobaYiN019PkySvjV",  # "Antoni" — passionate, intense male
        "name": "Steve Jobs", "stability": 0.45, "similarity_boost": 0.80, "style": 0.60, "language": "de",
    },
    "branson": {
        "voice_id": "VR6AewLTigWG4xSOukaG",  # "Arnold" — energetic, charismatic male
        "name": "Richard Branson", "stability": 0.50, "similarity_boost": 0.75, "style": 0.55, "language": "de",
    },
    "sandberg": {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",  # "Sarah" — German business professional female
        "name": "Sheryl Sandberg", "stability": 0.60, "similarity_boost": 0.75, "style": 0.35, "language": "de",
    },
    "page": {
        "voice_id": "pqHfZKP75CvOlQylNhV4",  # "Bill" — thoughtful, analytical male
        "name": "Larry Page", "stability": 0.60, "similarity_boost": 0.75, "style": 0.30, "language": "de",
    },
    "hastings": {
        "voice_id": "JBFqnCBsd6RMkjVDRZzb",  # "George" — authoritative, direct male
        "name": "Reed Hastings", "stability": 0.55, "similarity_boost": 0.75, "style": 0.40, "language": "de",
    },
}

MODEL_ID = "eleven_multilingual_v2"  # supports both DE + EN

# Fallback voice config used when a voice_id is no longer available on ElevenLabs
DEFAULT_VOICE_CONFIG = {
    "voice_id": "EXAVITQu4vr4xnSDxMaL",  # "Sarah" — reliable default
    "stability": 0.55, "similarity_boost": 0.75, "style": 0.35, "language": "de",
}
MAX_TEXT_LENGTH = 800  # ~60s of audio — enough for intros/quotes, protects cost


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    persona: str = Field(..., description="Persona key: wlad, bezos, musk, oprah, jobs, branson, sandberg, page, hastings")


# ── Helpers ─────────────────────────────────────────────────────────────────

def _cache_key(text: str, voice_id: str) -> str:
    """Stable hash for caching identical text+voice combinations."""
    raw = f"{voice_id}:{text}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


async def _get_cached_audio(cache_key: str) -> Optional[str]:
    doc = await db.voice_cache.find_one({"cache_key": cache_key}, {"_id": 0, "audio_b64": 1})
    return doc["audio_b64"] if doc else None


async def _save_cached_audio(cache_key: str, persona: str, text: str, voice_id: str, audio_b64: str) -> None:
    await db.voice_cache.update_one(
        {"cache_key": cache_key},
        {"$set": {
            "cache_key": cache_key,
            "persona": persona,
            "voice_id": voice_id,
            "text_preview": text[:100],
            "audio_b64": audio_b64,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )


def _synthesize(text: str, voice_config: dict) -> bytes:
    """Blocking synthesis — returns raw MP3 bytes. Run inside run_in_threadpool."""
    client = _get_client()
    try:
        from elevenlabs import VoiceSettings
    except ImportError:
        from elevenlabs.types import VoiceSettings
    settings = VoiceSettings(
        stability=voice_config["stability"],
        similarity_boost=voice_config["similarity_boost"],
        style=voice_config.get("style", 0.0),
        use_speaker_boost=True,
    )
    stream = client.text_to_speech.convert(
        text=text,
        voice_id=voice_config["voice_id"],
        model_id=MODEL_ID,
        voice_settings=settings,
        output_format="mp3_44100_128",
    )
    return b"".join(chunk for chunk in stream)


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/personas")
async def list_personas() -> dict:
    """Return the voice-persona registry (for frontend to know which personas are speakable)."""
    return {
        "personas": [
            {"persona": k, "name": v["name"], "language": v["language"]}
            for k, v in VOICE_REGISTRY.items()
        ],
        "model": MODEL_ID,
    }


@router.post("/tts")
async def text_to_speech(data: TTSRequest, request: Request) -> dict:
    """Generate speech for a given persona. Uses MongoDB cache for repeat requests.

    Returns `{audio_url: 'data:audio/mpeg;base64,...', cached: bool, persona, voice_id}`.
    """
    await get_current_user(request)  # require auth

    persona_key = data.persona.lower()
    voice_config = VOICE_REGISTRY.get(persona_key)
    if not voice_config:
        raise HTTPException(status_code=400, detail=f"Unknown persona '{persona_key}'. Available: {list(VOICE_REGISTRY.keys())}")

    text = data.text.strip()
    cache_key = _cache_key(text, voice_config["voice_id"])

    # 1. Try cache
    cached_b64 = await _get_cached_audio(cache_key)
    if cached_b64:
        return {
            "audio_url": f"data:audio/mpeg;base64,{cached_b64}",
            "cached": True,
            "persona": persona_key,
            "voice_id": voice_config["voice_id"],
        }

    # 2. Synthesize
    audio_bytes: bytes = b""  # pre-init to satisfy strict static analysis
    try:
        from fastapi.concurrency import run_in_threadpool
        audio_bytes = await run_in_threadpool(_synthesize, text, voice_config)
    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e).lower()
        # On 401 Unauthorized from ElevenLabs, drop cached client so next request
        # re-reads ELEVENLABS_API_KEY (handles rotation without pod restart).
        if "401" in err_msg or "unauthorized" in err_msg or "invalid_api_key" in err_msg:
            logger.warning(f"ElevenLabs 401 — resetting client for next request: {e}")
            _reset_client()
            raise HTTPException(status_code=502, detail="Voice service authentication failed — key may have rotated")
        # Fallback to default voice when a voice_id has been removed from ElevenLabs
        if "voice_not_found" in err_msg or "was not found" in err_msg:
            logger.warning(f"Voice {voice_config['voice_id']} not found — falling back to default: {e}")
            try:
                audio_bytes = await run_in_threadpool(_synthesize, text, DEFAULT_VOICE_CONFIG)
            except Exception as fallback_err:
                logger.error(f"Default voice fallback also failed: {fallback_err}")
                raise HTTPException(status_code=502, detail=f"Voice synthesis failed: {fallback_err}")
        else:
            logger.error(f"ElevenLabs synthesis failed: {e}")
            raise HTTPException(status_code=502, detail=f"Voice synthesis failed: {e}")

    audio_b64 = base64.b64encode(audio_bytes).decode("ascii")

    # 3. Cache (only if under 250 KB — prevents collection bloat)
    if len(audio_b64) < 250_000:
        try:
            await _save_cached_audio(cache_key, persona_key, text, voice_config["voice_id"], audio_b64)
        except Exception as e:
            logger.warning(f"Voice cache write failed: {e}")

    return {
        "audio_url": f"data:audio/mpeg;base64,{audio_b64}",
        "cached": False,
        "persona": persona_key,
        "voice_id": voice_config["voice_id"],
        "bytes": len(audio_bytes),
    }


@router.delete("/cache")
async def clear_voice_cache(request: Request, persona: Optional[str] = None) -> dict:
    """Admin-only: clear the voice cache.

    Optional `?persona=wlad` scopes deletion to a single persona (only that voice's
    cached audio is cleared — useful after changing just one voice_id mapping).
    Without the query param, the entire cache is wiped.
    """
    await require_admin(request)  # honours ADMIN_EMAILS whitelist + is_admin flag

    query: dict = {}
    if persona:
        persona_key = persona.lower()
        if persona_key not in VOICE_REGISTRY:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown persona '{persona_key}'. Available: {list(VOICE_REGISTRY.keys())}",
            )
        query = {"persona": persona_key}

    result = await db.voice_cache.delete_many(query)
    return {"deleted": result.deleted_count, "scope": persona or "all"}



# ── Audio-Mode: Conversational Voice Endpoint ───────────────────────────────
# ChatGPT/Claude-style voice mode: audio-in → transcript → LLM → audio-out.

VOICE_CONVO_SYSTEM_PROMPT = """Du bist WladBot — ein deutschsprachiger Leadership-Coach im LIVE-VOICE-MODUS.

WICHTIG für Voice:
- Antworte natürlich gesprochen, wie in einem echten Gespräch.
- Maximal 2-3 kurze Sätze (60-90 Wörter), niemals länger.
- Kein JSON, keine Listen, keine Aufzählungspunkte, keine Überschriften.
- Keine Markdown-Formatierung, keine Sterne, keine Klammern.
- Stelle gerne Rückfragen, halte den Dialog am Leben.
- Sprich Deutsch, sei direkt, warm, charismatisch — wie Wlad Jachtchenko persönlich.
- Wenn der User unklar spricht, frage präzise nach.
"""


class VoiceConvoResponse(BaseModel):
    session_id: str
    transcript: str
    response_text: str
    audio_url: str
    persona: str


async def _transcribe_webm(audio_bytes: bytes) -> str:
    """Whisper transcription. Auto-detects language but biases to DE."""
    from emergentintegrations.llm.openai import OpenAISpeechToText
    stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    try:
        with open(tmp_path, "rb") as f:
            response = await stt.transcribe(file=f, model="whisper-1", response_format="json", language="de")
        return (response.text or "").strip()
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


async def _voice_llm_reply(session_id: str, user_id: str, transcript: str, user_memory: str) -> str:
    """Generate a short conversational reply for voice mode."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    history = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0, "role": 1, "content": 1}
    ).sort("created_at", 1).to_list(20)

    memory_block = f"\n\n--- USER MEMORY ---\n{user_memory}\n---" if user_memory else ""
    system_msg = VOICE_CONVO_SYSTEM_PROMPT + memory_block

    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"voicemode_{session_id}", system_message=system_msg)
    chat.with_model("openai", "gpt-5.2")

    # Build short context — only last 6 turns to keep TTS latency low
    ctx_lines = []
    for m in history[-6:]:
        role = "User" if m.get("role") == "user" else "Coach"
        # Strip JSON-style artifacts from previous structured replies
        content = m.get("content", "")
        if content.startswith("{") and len(content) > 200:
            content = "(vorherige Coaching-Antwort)"
        ctx_lines.append(f"{role}: {content}")
    ctx = "\n".join(ctx_lines)
    prompt = f"{ctx}\nUser: {transcript}\nCoach:" if ctx else transcript

    reply = await chat.send_message(UserMessage(text=prompt))
    return (reply or "").strip()


async def _ensure_voice_session(session_id: Optional[str], user_id: str, transcript: str) -> str:
    """Create a voice chat session if none exists, return session_id."""
    if session_id:
        return session_id
    new_id = f"chat_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    await db.chat_sessions.insert_one({
        "session_id": new_id, "user_id": user_id,
        "title": transcript[:50], "agent": None, "mode": "voice",
        "created_at": now, "updated_at": now,
    })
    return new_id


async def _persist_voice_turn(session_id: str, user_id: str, role: str, content: str) -> None:
    """Persist a single user/assistant voice-mode turn to chat_messages."""
    await db.chat_messages.insert_one({
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        "session_id": session_id, "user_id": user_id,
        "role": role, "content": content, "mode": "voice",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


def _cap_reply_length(text: str) -> str:
    """Trim reply to TTS-safe length on a word boundary."""
    if not text:
        return "Sag das nochmal — habe ich nicht ganz verstanden."
    if len(text) > MAX_TEXT_LENGTH:
        return text[:MAX_TEXT_LENGTH].rsplit(" ", 1)[0] + "."
    return text


async def _synthesize_or_cached(reply_text: str, persona_key: str, voice_config: dict) -> str:
    """Return base64-encoded TTS audio, using cache when available."""
    cache_key = _cache_key(reply_text, voice_config["voice_id"])
    cached = await _get_cached_audio(cache_key)
    if cached:
        return cached
    try:
        from fastapi.concurrency import run_in_threadpool
        audio_bytes_out = await run_in_threadpool(_synthesize, reply_text, voice_config)
    except Exception as e:
        err_msg = str(e).lower()
        if "401" in err_msg or "unauthorized" in err_msg or "invalid_api_key" in err_msg:
            _reset_client()
            logger.error(f"Voice TTS failed: {e}")
            raise HTTPException(status_code=502, detail=f"Voice synthesis failed: {e}")
        # Fallback to default voice when a voice_id has been removed from ElevenLabs
        if "voice_not_found" in err_msg or "was not found" in err_msg:
            logger.warning(f"Voice {voice_config['voice_id']} not found — falling back to default: {e}")
            try:
                audio_bytes_out = await run_in_threadpool(_synthesize, reply_text, DEFAULT_VOICE_CONFIG)
            except Exception as fallback_err:
                logger.error(f"Default voice fallback also failed: {fallback_err}")
                raise HTTPException(status_code=502, detail=f"Voice synthesis failed: {fallback_err}")
        else:
            logger.error(f"Voice TTS failed: {e}")
            raise HTTPException(status_code=502, detail=f"Voice synthesis failed: {e}")
    audio_b64 = base64.b64encode(audio_bytes_out).decode("ascii")
    if len(audio_b64) < 250_000:
        try:
            await _save_cached_audio(cache_key, persona_key, reply_text, voice_config["voice_id"], audio_b64)
        except Exception as e:
            logger.warning(f"Voice cache write failed: {e}")
    return audio_b64


@router.post("/conversation", response_model=VoiceConvoResponse)
async def voice_conversation(
    request: Request,
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    persona: str = Form("wlad"),
) -> VoiceConvoResponse:
    """Audio-in → audio-out single-shot voice turn for ChatGPT-style audio mode.

    Pipeline: Whisper STT → GPT-5.2 short reply → ElevenLabs TTS → persist turns.
    Credit is deducted only after a valid transcript exists.
    """
    from routes.credits import check_and_deduct_credit
    user = await get_current_user(request)

    persona_key = persona.lower()
    voice_config = VOICE_REGISTRY.get(persona_key)
    if not voice_config:
        raise HTTPException(status_code=400, detail=f"Unknown persona '{persona_key}'")

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio")

    # 1. Transcribe BEFORE deducting credit (no credit burn on bad audio)
    try:
        transcript = await _transcribe_webm(audio_bytes)
    except Exception as e:
        logger.error(f"Voice transcription failed: {e}")
        raise HTTPException(status_code=502, detail=f"Transcription failed: {e}")
    if not transcript:
        raise HTTPException(status_code=400, detail="empty_transcript")

    # 2. Charge credit
    credit_result = await check_and_deduct_credit(user, "chat")
    if not credit_result["allowed"]:
        raise HTTPException(status_code=402, detail="no_credits")

    # 3. Session + user turn
    session_id = await _ensure_voice_session(session_id, user["user_id"], transcript)
    await _persist_voice_turn(session_id, user["user_id"], "user", transcript)

    # 4. LLM reply
    user_memory = await get_user_memory(user["user_id"])
    try:
        reply_text = await _voice_llm_reply(session_id, user["user_id"], transcript, user_memory)
    except Exception as e:
        logger.error(f"Voice LLM reply failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI reply failed: {e}")
    reply_text = _cap_reply_length(reply_text)

    # 5. Persist assistant turn + bump session timestamp
    await _persist_voice_turn(session_id, user["user_id"], "assistant", reply_text)
    await db.chat_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )

    # 6. TTS (cached)
    audio_b64 = await _synthesize_or_cached(reply_text, persona_key, voice_config)

    try:
        await record_user_action(user["user_id"], "chat_message", metadata={"session_id": session_id, "mode": "voice"})
    except Exception as e:
        logger.warning(f"record_user_action failed: {e}")

    return VoiceConvoResponse(
        session_id=session_id,
        transcript=transcript,
        response_text=reply_text,
        audio_url=f"data:audio/mpeg;base64,{audio_b64}",
        persona=persona_key,
    )
