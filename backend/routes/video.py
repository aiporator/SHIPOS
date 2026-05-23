"""Video challenge routes with Wlad Jachtchenko methodology feedback."""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File
import uuid
import json
import os
import tempfile
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAISpeechToText

from config import db, EMERGENT_LLM_KEY, logger
from services import get_current_user, get_user_memory
from services_actions import record_user_action
from services_tier import require_feature, resolve_user_tier
from services_video_trial import get_video_trial_status, consume_video_trial

router = APIRouter(prefix="/api", tags=["video"])


def _build_rating_context(mode: str, level: str, focus: str, audience: str) -> str:
    """Build AI prompt modifier based on user's rating preferences."""
    parts = ["\n\nBEWERTUNGS-KONTEXT:"]

    if mode == "soft":
        parts.append("""BEWERTUNGSMODUS: ERMUTIGEND (Soft)
- Fokussiere auf Stärken und was gut gelaufen ist.
- Gib konstruktives Feedback in einem motivierenden, ermutigenden Ton.
- Bewerte wohlwollend — gib dem User das Gefühl, auf dem richtigen Weg zu sein.
- Scores sollten tendenziell 5-15 Punkte höher ausfallen als bei strenger Bewertung.
- Beginne IMMER mit dem Positiven. Formuliere Verbesserungen als 'Potenzial' statt 'Schwäche'.""")
    else:
        parts.append("""BEWERTUNGSMODUS: EHRLICH & DIREKT (Hard)
- Bewerte schonungslos ehrlich — wie ein erfahrener Executive Coach.
- Benenne Schwächen klar und direkt, ohne Beschönigung.
- Vergleiche gegen Top 1% der Führungskräfte als Benchmark.
- Scores müssen die tatsächliche Qualität widerspiegeln — keine Inflation.
- Sei direkt wie Wlad Jachtchenko in seinen Trainings: respektvoll aber ungeschönt.""")

    level_map = {
        "einsteiger": "ERFAHRUNGSLEVEL: EINSTEIGER — Bewerte für jemanden, der erst anfängt Führungsverantwortung zu übernehmen. Erkläre Frameworks. Gib Basics.",
        "fortgeschritten": "ERFAHRUNGSLEVEL: FORTGESCHRITTEN — Der User kennt die Grundlagen. Fokussiere auf Nuancen, Feinschliff und strategische Tiefe.",
        "executive": "ERFAHRUNGSLEVEL: EXECUTIVE — Bewerte auf C-Level-Niveau. Erwarte Souveränität, strategische Klarheit und Board-Ready Kommunikation.",
    }
    if level in level_map:
        parts.append(level_map[level])

    if focus:
        focus_items = [f.strip() for f in focus.split(",") if f.strip()]
        focus_labels = {
            "klarheit": "Klarheit & Präzision der Botschaft",
            "empathie": "Empathie & emotionale Intelligenz",
            "struktur": "Struktur & Aufbau der Argumentation",
            "ueberzeugungskraft": "Überzeugungskraft & Charisma",
        }
        if focus_items:
            named = [focus_labels.get(f, f) for f in focus_items]
            parts.append(f"FOKUS-BEREICHE: Bewerte besonders intensiv: {', '.join(named)}. Gib zu diesen Bereichen jeweils mindestens 2 Sätze detailliertes Feedback.")

    audience_map = {
        "team": "ZIELGRUPPE: TEAM — Die Rede richtet sich an das eigene Team. Bewerte Nahbarkeit, Motivation und Delegationskompetenz.",
        "board": "ZIELGRUPPE: BOARD/VORSTAND — Die Rede richtet sich an den Vorstand. Bewerte Executive Presence, Datenorientierung und strategische Klarheit.",
        "kunden": "ZIELGRUPPE: KUNDEN — Die Rede richtet sich an Kunden. Bewerte Überzeugungskraft, Nutzenargumentation und Vertrauensaufbau.",
        "investoren": "ZIELGRUPPE: INVESTOREN — Die Rede richtet sich an Investoren. Bewerte Vision, Zahlenorientierung und Storytelling.",
        "allgemein": "ZIELGRUPPE: ALLGEMEIN — Bewerte für eine breite Zielgruppe.",
    }
    if audience in audience_map:
        parts.append(audience_map[audience])

    return "\n".join(parts)


@router.get("/rating-preferences")
async def get_rating_preferences(request: Request):
    """Get the user's global rating preferences."""
    user = await get_current_user(request)
    prefs = user.get("rating_preferences", {
        "mode": "hard",
        "level": "fortgeschritten",
        "focus": [],
        "audience": "allgemein",
    })
    return prefs

VIDEO_ANALYSIS_PROMPT = """Du bist WLADBOT Video-Analyse-Engine, entwickelt von Wlad Jachtchenko -- Europas führendem Kommunikations- und Leadership-Coach.

DEINE ANALYSE-FRAMEWORKS (basierend auf Wlads Methodik):

1. DIE 3 SAEULEN DER UEBERZEUGUNG (Aristoteles via Wlad):
   - LOGOS: Logik, Daten, Struktur der Argumentation
   - ETHOS: Glaubwürdigkeit, Autoritaet, Souveränität
   - PATHOS: Emotionale Wirkung, Storytelling, Engagement

2. DER KOMMUNIKATIONSQUADRANT:
   - Klarheit: Ist die Botschaft präzise und unmissverständlich?
   - Empathie: Zeigt der Sprecher Verständnis für das Publikum?
   - Struktur: Gibt es eine klare Einleitung, Hauptteil, Schluss?
   - Mut: Werden schwierige Wahrheiten angesprochen?

3. KOERPERSPRACHE-INDIKATOREN (aus Transkript-Tonfall):
   - Sprechgeschwindigkeit und Pausen
   - Fuellwoerter und Unsicherheitsmarker
   - Satzlaenge und Komplexität

4. SCHWARZE RHETORIK CHECK:
   - Werden Manipulationstechniken vermieden?
   - Ist die Kommunikation authentisch und ehrlich?

WICHTIG: Gib dein Feedback IMMER auf DEUTSCH. Sprich den User direkt an ("Du hast...", "Deine Stärke ist...").
Referenziere IMMER ein spezifisches Wlad-Framework in deinem Feedback.

Antworte NUR mit validem JSON. Kein extra Text."""


async def _transcribe_audio(file: UploadFile) -> str:
    """Transcribe uploaded audio file using OpenAI Whisper."""
    stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
    contents = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name
    with open(tmp_path, "rb") as audio_file:
        response = await stt.transcribe(file=audio_file, model="whisper-1", response_format="json", language="de")
    os.unlink(tmp_path)
    return response.text


def _build_analysis_prompt(challenge: dict, transcript: str, prev_attempts: list, user_memory: str, rating_context: str) -> str:
    """Build the full analysis prompt for the AI model."""
    prev_context = ""
    if prev_attempts:
        prev_scores = [a.get("analysis", {}).get("overall_score", 0) for a in prev_attempts if a.get("analysis")]
        if prev_scores:
            prev_context = f"\nDer User hat diese Challenge bereits {len(prev_scores)}x gemacht. Letzte Scores: {prev_scores}. Gib Feedback ob sich der User verbessert hat."

    memory_context = f"\n\nUSER PROFIL:\n{user_memory}" if user_memory else ""

    return f"""Analysiere diese Leadership-Rede für die Mission: "{challenge['title']}" - {challenge['description']}
{prev_context}{memory_context}

TRANSKRIPT:
\"{transcript}\"

Bewerte DETAILLIERT anhand von Wlads Methodik. Antworte als JSON:
{{
  "overall_score": 0-100,
  "clarity_score": 0-100,
  "confidence_score": 0-100,
  "empathy_score": 0-100,
  "structure_score": 0-100,
  "logos_score": 0-100,
  "ethos_score": 0-100,
  "pathos_score": 0-100,
  "transcript": "das originale Transkript",
  "wlad_assessment": "3-4 Sätze persönliches Feedback im Stil von Wlad Jachtchenko.",
  "framework_feedback": {{
    "drei_saeulen": "Wie gut nutzt der User Logos, Ethos und Pathos?",
    "kommunikationsquadrant": "Bewertung: Klarheit, Empathie, Struktur, Mut."
  }},
  "strengths": ["Stärke 1 mit Beispiel", "Stärke 2 mit Beispiel"],
  "improvements": ["Verbesserung 1 mit Übung", "Verbesserung 2 mit Übung"],
  "speech_analysis": {{
    "filler_words": ["aehm", "also"],
    "filler_count": 0,
    "avg_sentence_length": "kurz/mittel/lang",
    "speech_pace": "zu schnell/gut/zu langsam",
    "key_phrases": ["starke Formulierung 1"]
  }},
  "rewrite_suggestion": "Überarbeitete Version der Rede (2-3 Absätze).",
  "practice_exercises": ["Übung 1", "Übung 2", "Übung 3"],
  "improvement_vs_previous": "Vergleich mit vorherigen Versuchen (falls vorhanden)"
}}"""


def _get_rating_params(request, user):
    """Extract rating parameters from request query params with user preference fallback."""
    params = request.query_params
    global_prefs = user.get("rating_preferences", {})
    return {
        "mode": params.get("rating_mode") or global_prefs.get("mode", "hard"),
        "level": params.get("rating_level") or global_prefs.get("level", "fortgeschritten"),
        "focus": params.get("rating_focus") or ",".join(global_prefs.get("focus", [])),
        "audience": params.get("rating_audience") or global_prefs.get("audience", "allgemein"),
    }


@router.get("/video-challenges")
async def get_video_challenges():
    from data import VIDEO_CHALLENGES
    return VIDEO_CHALLENGES


async def _run_video_ai_analysis(challenge: dict, transcript: str, prev_attempts: list, user_memory, rating_context: str) -> dict:
    """Call GPT-5.2 to analyse transcript and return structured feedback."""
    prompt_text = _build_analysis_prompt(challenge, transcript, prev_attempts, user_memory, rating_context)
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"vid_{uuid.uuid4().hex[:8]}",
        system_message=VIDEO_ANALYSIS_PROMPT + rating_context + (f"\n\nUSER PROFIL:\n{user_memory}" if user_memory else ""),
    )
    chat.with_model("openai", "gpt-5.2")

    ai_response = await chat.send_message(UserMessage(text=prompt_text))
    try:
        analysis = json.loads(ai_response)
    except json.JSONDecodeError:
        analysis = {"feedback": ai_response, "overall_score": 50, "transcript": transcript, "wlad_assessment": ai_response}
    analysis["transcript"] = transcript
    return analysis


async def _persist_video_analysis(user_id: str, challenge_id: str, analysis: dict, rating: dict, attempt_count: int) -> None:
    """Save video analysis entry + trigger XP/action recording."""
    await db.video_challenges.insert_one({
        "entry_id": f"vid_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "challenge_id": challenge_id,
        "analysis": analysis,
        "rating_context": rating,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    overall = analysis.get("overall_score", 0)
    await record_user_action(
        user_id,
        "video_challenge_completed",
        comm_bonus=max(1, overall // 25),
        leadership_bonus=max(1, analysis.get("ethos_score", overall) // 33),
        eq_bonus=max(1, analysis.get("empathy_score", 0) // 33),
        metadata={"challenge_id": challenge_id, "score": overall, "attempt": attempt_count},
    )


@router.get("/user/video-trial-status")
async def get_user_video_trial_status(request: Request):
    user = await get_current_user(request)
    tier_info = await resolve_user_tier(user)
    return await get_video_trial_status(user, tier_info["tier"])


@router.post("/video-challenges/{challenge_id}/analyze")
async def analyze_video_challenge(challenge_id: str, request: Request, file: UploadFile = File(...)):
    from data import VIDEO_CHALLENGES
    from routes.credits import check_and_deduct_credit
    user = await get_current_user(request)

    # Trial-first: Free + Starter + Standard get 3 free analyses in their first 14 days.
    # Accelerator skips the trial entirely (require_feature returns immediately).
    tier_info = await resolve_user_tier(user)
    trial = await get_video_trial_status(user, tier_info["tier"])
    used_trial_slot = False
    if trial["active"]:
        # Inside trial window with quota remaining → bypass require_feature, consume slot.
        await consume_video_trial(user["user_id"])
        used_trial_slot = True
    else:
        # Either Accelerator (passes) or trial-ineligible/expired (raises 402 with upgrade detail).
        await require_feature(user, "video_analysis")

    credit_result = await check_and_deduct_credit(user, "video_mission")
    if not credit_result["allowed"]:
        raise HTTPException(status_code=402, detail="no_credits")

    challenge = next((c for c in VIDEO_CHALLENGES if c["challenge_id"] == challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    rating = _get_rating_params(request, user)
    rating_context = _build_rating_context(rating["mode"], rating["level"], rating["focus"], rating["audience"])
    user_memory = await get_user_memory(user["user_id"])
    prev_attempts = await db.video_challenges.find(
        {"user_id": user["user_id"], "challenge_id": challenge_id},
        {"_id": 0, "analysis.overall_score": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(5)

    try:
        transcript = await _transcribe_audio(file)
        analysis = await _run_video_ai_analysis(challenge, transcript, prev_attempts, user_memory, rating_context)
        await _persist_video_analysis(user["user_id"], challenge_id, analysis, rating, len(prev_attempts) + 1)
        # Attach trial metadata for the UI banner (X / 3 remaining etc.)
        if used_trial_slot:
            analysis["_trial"] = await get_video_trial_status(
                await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0}) or user,
                tier_info["tier"],
            )
        return analysis
    except Exception as e:
        logger.error(f"Video challenge error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice/transcribe")
async def transcribe_voice(request: Request, file: UploadFile = File(...)):
    await get_current_user(request)
    try:
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        contents = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        with open(tmp_path, "rb") as audio_file:
            response = await stt.transcribe(file=audio_file, model="whisper-1", response_format="json", language="de")
        os.unlink(tmp_path)
        return {"text": response.text}
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
