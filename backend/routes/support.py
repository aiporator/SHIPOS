"""WladHelp Support routes — AI-assisted self-service support.

Iter 92.15 (Mert: "WladHelp Button fehlt noch, Support automatisieren"):
This is a lightweight LLM-powered support endpoint. The frontend
WladHelpButton component opens a chat-style modal where users can ask
questions. Common questions hit our FAQ snippets first (cheap, instant);
anything novel goes through GPT-5.2 with a tight system prompt that:
  • Answers Leader-OS-specific questions (tiers, features, billing, account)
  • Falls back gracefully to "book a strategy call" or "email support"
  • Saves the message + answer in `support_messages` for follow-up auditing

Why not just the existing /api/chat?
  /api/chat is WladBot (leadership coaching mode). It doesn't know our
  pricing tiers, payment troubleshooting, or refund policy. WladHelp is
  the support-shaped sister-agent.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from emergentintegrations.llm.chat import LlmChat, UserMessage

from config import db, EMERGENT_LLM_KEY, logger
from services import get_current_user

router = APIRouter(prefix="/api/support", tags=["support"])

SUPPORT_SYSTEM_PROMPT = """Du bist WladHelp — der Support-Agent für Leader-OS, die KI-native Leadership-Plattform basierend auf Wlad Jachtchenkos Argumentorik-Methoden.

ROLLE: Du beantwortest Support-Fragen in 2-4 Sätzen, freundlich aber prägnant. Du bist KEIN Coach (dafür gibt es WladBot/Chat). Du bist KEIN Verkäufer (du drängst nichts auf).

WAS DU WEISST:
• Tiers: Free (limitiert) · Leadership OS €997/Jahr · OS PLUS €4.447/Jahr (mit 12 Einzelcoachings)
• Bezahlung: Stripe, einmalig oder Rate (2x oder 12x), 30-Tage-Geld-zurück-Garantie
• Features: WladBot Chat 24/7 · 30-Tage Sprint · Video-Analyse · Playbooks · Simulationen · Cal.com Coaching · Donnerstag-Cohort-Events
• Onboarding: 7-Step Onboarding inkl. Strategiegespräch-CTA
• Support-Email: support@leader-os.de
• Strategiegespräch buchen: cal.com/leaderos/beratung (15 Min · 1:1 · unverbindlich)

WIE DU ANTWORTEST:
• Direkt, ohne Floskeln
• Auf Deutsch wenn die Frage Deutsch ist, sonst Englisch
• Bei Bezahlfragen → "Bei Zahlungs- oder Refund-Fragen schreib bitte an support@leader-os.de mit deiner Stripe-Receipt-ID, dann lösen wir das in 24h."
• Bei Bug-Reports → kurz bestätigen + "Wir leiten es an das Engineering-Team weiter"
• Bei "Wie buche ich Coaching?" → Strategiegespräch-Link
• Bei "Wie funktioniert X?" → kurze Erklärung + Link zur betroffenen Page

NIEMALS:
• Long-form Coaching geben (das ist WladBots Job)
• Versprechen die nicht abdeckt sind (z.B. Custom Pricing ohne Enterprise-Form)
• Andere Anbieter empfehlen
"""


class SupportAskIn(BaseModel):
    message: str = Field(min_length=2, max_length=2000)
    session_id: Optional[str] = None


class SupportAskOut(BaseModel):
    answer: str
    session_id: str
    suggested_actions: List[dict] = []


# Quick FAQ — these are matched before hitting the LLM (saves cost + faster).
# Each entry: (substring-trigger lowercase, response, suggested_actions)
FAQ_SHORTCUTS = [
    {
        "triggers": ["refund", "rückerstattung", "geld zurück", "geld-zurück", "money back"],
        "answer": "Wir haben eine 30-Tage-Geld-zurück-Garantie auf Leadership OS und OS PLUS. Schreib einfach mit deiner Stripe-Receipt-ID an support@leader-os.de — Refund kommt in 24-48h.",
        "actions": [{"label": "Support-Email öffnen", "type": "mailto", "value": "support@leader-os.de"}],
    },
    {
        "triggers": ["coaching buchen", "strategie", "termin buch", "book a call", "appointment"],
        "answer": "Buch dein 15-Min Strategiegespräch direkt auf cal.com/leaderos/beratung. 1:1 mit unserem Argumentorik-Berater, unverbindlich.",
        "actions": [{"label": "Termin buchen", "type": "external", "value": "https://cal.com/leaderos/beratung"}],
    },
    {
        "triggers": ["upgrade", "plus kaufen", "leadership os holen", "tier wechsel"],
        "answer": "Upgrade läuft über die /coaching Page → wähl dein Paket → Stripe-Checkout. Bei Rückfragen zur Tier-Aktivierung: support@leader-os.de.",
        "actions": [{"label": "Zu /coaching", "type": "internal", "value": "/coaching"}],
    },
    {
        "triggers": ["passwort", "password reset", "login fail", "kann mich nicht einloggen"],
        "answer": "Passwort-Reset via Magic-Link: auf /login → 'Magic Link' Tab → E-Mail eingeben. Falls die Mail nicht kommt: Spam-Folder checken, sonst support@leader-os.de.",
        "actions": [{"label": "Zur Login-Page", "type": "internal", "value": "/login"}],
    },
    {
        "triggers": ["unsubscribe", "abmelden", "keine emails mehr"],
        "answer": "Klick in jeder Email auf den 'Abmelden'-Link am Ende — wir entfernen dich sofort aus dem Verteiler. Oder direkt: support@leader-os.de.",
        "actions": [],
    },
    {
        "triggers": ["wlad jachtchenko wer", "wer ist wlad", "über wlad"],
        "answer": "Wlad Jachtchenko ist Argumentorik-Experte, Bestseller-Autor und Top-Speaker (2.500+ Führungskräfte trainiert, von Startups bis DAX). Leader-OS digitalisiert seine Methodik mit KI.",
        "actions": [],
    },
]


def _match_faq(message: str):
    """Return matching FAQ entry or None."""
    lower = message.lower()
    for entry in FAQ_SHORTCUTS:
        if any(t in lower for t in entry["triggers"]):
            return entry
    return None


@router.post("/ask", response_model=SupportAskOut)
async def support_ask(data: SupportAskIn, request: Request):
    """Single-turn support Q&A. Persists message + answer for audit."""
    user = await get_current_user(request)
    session_id = data.session_id or f"sup_{uuid.uuid4().hex[:12]}"

    msg = data.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Frage darf nicht leer sein.")

    # 1) FAQ shortcut — instant, no LLM cost
    faq = _match_faq(msg)
    if faq:
        answer = faq["answer"]
        suggested = faq["actions"]
        source = "faq"
    else:
        # 2) LLM fallback for novel questions
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=SUPPORT_SYSTEM_PROMPT,
            )
            chat.with_model("openai", "gpt-5.2")
            llm_response = await chat.send_message(UserMessage(text=msg))
            answer = (llm_response or "").strip()
            if not answer:
                raise RuntimeError("Empty LLM response")
            # Always offer book-a-call + email as fallback actions
            suggested = [
                {"label": "15 Min Strategiegespräch", "type": "external", "value": "https://cal.com/leaderos/beratung"},
                {"label": "Email an Support", "type": "mailto", "value": "support@leader-os.de"},
            ]
            source = "llm"
        except Exception as e:
            logger.error(f"WladHelp LLM error: {e}")
            answer = ("Ich konnte deine Frage gerade nicht beantworten. "
                      "Schreib uns kurz auf support@leader-os.de oder buch ein 15-Min Strategiegespräch — "
                      "wir melden uns innerhalb von 24h.")
            suggested = [
                {"label": "Email an Support", "type": "mailto", "value": "support@leader-os.de"},
                {"label": "15 Min Strategiegespräch", "type": "external", "value": "https://cal.com/leaderos/beratung"},
            ]
            source = "fallback"

    # Persist for audit / future ML training data
    try:
        await db.support_messages.insert_one({
            "message_id": f"sm_{uuid.uuid4().hex[:12]}",
            "session_id": session_id,
            "user_id": user["user_id"],
            "user_email": user.get("email"),
            "user_tier": user.get("tier", "free"),
            "question": msg,
            "answer": answer,
            "source": source,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.warning(f"WladHelp persist failed (non-blocking): {e}")

    return SupportAskOut(answer=answer, session_id=session_id, suggested_actions=suggested)
