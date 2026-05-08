"""Resend email service for transactional emails (event reminders, confirmations)."""
import os
import asyncio
import logging
from datetime import datetime
from typing import Optional

import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
BRAND_NAME = "WladBot"
BRAND_COLOR = "#BFFF00"
BRAND_DARK = "#0A0A0A"


def _init_resend():
    if not RESEND_API_KEY:
        return False
    resend.api_key = RESEND_API_KEY
    return True


def is_enabled() -> bool:
    """Check whether Resend is configured and ready."""
    return bool(RESEND_API_KEY)


async def send_email(
    to: str,
    subject: str,
    html: str,
    from_email: Optional[str] = None,
) -> dict:
    """Send an email via Resend (async, non-blocking).

    Returns {"sent": bool, "email_id": str|None, "error": str|None}.
    Silent if API key missing — logs warning and returns sent=False.
    """
    if not _init_resend():
        logger.warning("RESEND_API_KEY not set — skipping email to %s", to)
        return {"sent": False, "email_id": None, "error": "RESEND_API_KEY not configured"}

    params = {
        "from": from_email or f"{BRAND_NAME} <{SENDER_EMAIL}>",
        "to": [to],
        "subject": subject,
        "html": html,
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"sent": True, "email_id": result.get("id"), "error": None}
    except Exception as e:
        logger.error("Resend send failed to %s: %s", to, e)
        return {"sent": False, "email_id": None, "error": str(e)}


# ── Email Templates ─────────────────────────────────────────────

def _base_layout(body_html: str, preheader: str = "") -> str:
    """Wrap content in WladBot branded email shell."""
    return f"""<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WladBot</title></head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F4;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:{BRAND_DARK};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
  <tr><td style="padding:28px 32px 0;">
    <table role="presentation" width="100%"><tr>
      <td style="vertical-align:middle;">
        <div style="display:inline-block;width:42px;height:42px;border-radius:12px;background:{BRAND_COLOR};text-align:center;line-height:42px;font-weight:900;font-size:20px;color:{BRAND_DARK};">W</div>
        <span style="font-weight:900;color:#fff;font-size:16px;margin-left:10px;letter-spacing:-0.02em;">WladBot</span>
      </td>
      <td style="text-align:right;font-size:10px;color:rgba(255,255,255,0.35);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Leadership OS</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:24px 32px 32px;color:#fff;">{body_html}</td></tr>
  <tr><td style="padding:20px 32px 28px;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="font-size:10px;color:rgba(255,255,255,0.35);margin:0;line-height:1.6;">
      Du erhältst diese Email, weil du dich für ein WladBot-Event registriert hast.<br>
      WladBot · Leadership Operating System · Powered by Wlad Jachtchenko's methods.
    </p>
  </td></tr>
</table></td></tr></table></body></html>"""


def _format_de_datetime(iso_str: str) -> tuple[str, str]:
    """Return (human_date, human_time) in German format."""
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
        months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
                  "August", "September", "Oktober", "November", "Dezember"]
        return (
            f"{days[dt.weekday()]}, {dt.day}. {months[dt.month - 1]} {dt.year}",
            dt.strftime("%H:%M") + " Uhr",
        )
    except Exception:
        return iso_str, ""


def event_registration_email(user_name: str, event: dict, calendar_url: str = "") -> tuple[str, str]:
    """Return (subject, html) for event registration confirmation."""
    date_str, time_str = _format_de_datetime(event.get("date", ""))
    subject = f"✓ Angemeldet: {event.get('title', 'Event')}"
    cal_btn = ""
    if calendar_url:
        cal_btn = f"""<a href="{calendar_url}" style="display:inline-block;background:{BRAND_COLOR};color:{BRAND_DARK};padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:-0.01em;">Zu Google Calendar hinzufügen</a>"""

    body = f"""
<div style="background:linear-gradient(135deg,rgba(191,255,0,0.12),rgba(154,204,0,0.04));border:1px solid rgba(191,255,0,0.2);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
  <div style="font-size:10px;letter-spacing:0.15em;color:{BRAND_COLOR};font-weight:800;text-transform:uppercase;margin-bottom:6px;">Anmeldung bestätigt</div>
  <div style="font-size:22px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">Du bist dabei, {user_name}.</div>
</div>
<h1 style="font-size:26px;font-weight:900;line-height:1.2;letter-spacing:-0.02em;margin:0 0 8px;">{event.get('title', 'Event')}</h1>
<p style="font-size:13px;color:rgba(255,255,255,0.55);margin:0 0 24px;line-height:1.55;">{event.get('description', '')[:220]}</p>

<table role="presentation" width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;margin-bottom:24px;"><tr>
<td style="padding:6px 0;"><div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Datum</div><div style="font-size:13px;font-weight:700;">{date_str}</div></td>
<td style="padding:6px 0;text-align:right;"><div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Uhrzeit</div><div style="font-size:13px;font-weight:700;color:{BRAND_COLOR};">{time_str}</div></td>
</tr></table>

<div style="text-align:center;padding:8px 0 4px;">{cal_btn}</div>
<p style="font-size:11px;color:rgba(255,255,255,0.3);margin:20px 0 0;text-align:center;">Wir erinnern dich 24h und 1h vor dem Event automatisch.</p>
"""
    return subject, _base_layout(body, preheader=f"Deine Anmeldung für {event.get('title', 'Event')} ist bestätigt.")


def event_reminder_email(user_name: str, event: dict, hours_until: float, calendar_url: str = "") -> tuple[str, str]:
    """Return (subject, html) for event reminder (1h or 24h before)."""
    date_str, time_str = _format_de_datetime(event.get("date", ""))
    is_soon = hours_until <= 2
    urgency = "Startet gleich" if is_soon else "Morgen"
    color_accent = "#FF4444" if is_soon else BRAND_COLOR
    subject = (
        f"⚡ Jetzt gleich: {event.get('title', 'Event')}"
        if is_soon
        else f"📅 Morgen: {event.get('title', 'Event')}"
    )
    cta_text = "Jetzt beitreten" if is_soon else "Details ansehen"
    cta_url = event.get("join_url") or calendar_url or "#"

    body = f"""
<div style="background:linear-gradient(135deg,{color_accent}22,{color_accent}08);border:1px solid {color_accent}40;border-radius:14px;padding:16px 20px;margin-bottom:24px;">
  <div style="font-size:10px;letter-spacing:0.2em;color:{color_accent};font-weight:800;text-transform:uppercase;margin-bottom:6px;">⚡ {urgency} · in {round(hours_until, 1)}h</div>
  <div style="font-size:22px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">Bereit, {user_name}?</div>
</div>

<h1 style="font-size:26px;font-weight:900;line-height:1.2;letter-spacing:-0.02em;margin:0 0 8px;">{event.get('title', 'Event')}</h1>
<p style="font-size:13px;color:rgba(255,255,255,0.55);margin:0 0 24px;line-height:1.55;">{event.get('description', '')[:220]}</p>

<table role="presentation" width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;margin-bottom:24px;"><tr>
<td style="padding:6px 0;"><div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Wann</div><div style="font-size:13px;font-weight:700;">{date_str}</div><div style="font-size:13px;font-weight:700;color:{color_accent};margin-top:2px;">{time_str}</div></td>
<td style="padding:6px 0;text-align:right;"><div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Host</div><div style="font-size:13px;font-weight:700;">{event.get('host', 'Wlad Jachtchenko')}</div></td>
</tr></table>

<div style="text-align:center;padding:8px 0 4px;">
  <a href="{cta_url}" style="display:inline-block;background:{BRAND_COLOR};color:{BRAND_DARK};padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:-0.01em;">{cta_text}</a>
</div>
<p style="font-size:11px;color:rgba(255,255,255,0.3);margin:20px 0 0;text-align:center;">Kann nicht? <a href="#" style="color:rgba(255,255,255,0.5);">Abmelden</a></p>
"""
    return subject, _base_layout(body, preheader=f"{urgency} · {event.get('title', '')} · {time_str}")


# ── Tier Welcome Sequences & Installment Emails ─────────────────────────────

TIER_WELCOME = {
    "starter": {
        "subject": "Willkommen im Starter-Kreis, {name} ⚡",
        "headline": "Dein Leadership-Start ist live.",
        "body": """Du hast Zugang zu den <b>6 Video-Kursen</b>, deinem <b>Leadership-Report</b>,
dem <b>30-Tage-Aktionsplan</b> und dem kostenlosen Buch von Wlad.<br><br>
<b>Dein nächster Schritt:</b> Starte mit Video 1 "Die Wlad-Formel" und markiere dir heute
den ersten Meilenstein. Wir melden uns in 3 Tagen wieder.""",
        "cta_label": "Jetzt Video 1 starten",
        "cta_path": "/coaching",
    },
    "standard": {
        "subject": "Willkommen im Leadership System, {name} 🔑",
        "headline": "Dein Lizenzschlüssel ist aktiv. 1 Jahr Vollzugang.",
        "body": """Ab sofort nutzt du:<br>
• WladBot AI Coach 24/7<br>
• Den kompletten 30-Tage Sprint<br>
• Alle Playbooks, Frameworks & Simulationen<br>
• Die AI Leadership Community<br><br>
<b>Dein heute-Ritual:</b> 5 Min Daily Check-in starten — dein XP-Konto wartet.""",
        "cta_label": "Zum Dashboard",
        "cta_path": "/dashboard",
    },
    "accelerator": {
        "subject": "Welcome, Accelerator. Deine 2 Jahre starten jetzt, {name}.",
        "headline": "VIP-Zugang aktiv. Dein 1:1 mit Wlad steht bereit.",
        "body": """Du bekommst als einziger Tier:<br>
• <b>Video-Analyse & Missionen exklusiv</b><br>
• <b>6× 1:1 Calls mit Wlad Jachtchenko</b><br>
• AI Learning Path (personalisiert)<br>
• Mastermind-Gruppe & Priority Support<br>
• Quartals-Reviews + Abschluss-Call<br><br>
<b>Dein erster Schritt:</b> Buche jetzt dein persönliches Onboarding-Gespräch.""",
        "cta_label": "Onboarding-Call buchen",
        "cta_path": "/coaching",
    },
}


def tier_welcome_email(tier: str, name: str, app_url: str = "https://leader-os.de") -> tuple[str, str]:
    cfg = TIER_WELCOME.get(tier, TIER_WELCOME["standard"])
    subject = cfg["subject"].format(name=name)
    cta_url = f"{app_url.rstrip('/')}{cfg['cta_path']}"
    body = f"""
<div style="background:linear-gradient(135deg,rgba(191,255,0,0.12),rgba(154,204,0,0.04));border:1px solid rgba(191,255,0,0.2);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
  <div style="font-size:10px;letter-spacing:0.2em;color:{BRAND_COLOR};font-weight:800;text-transform:uppercase;margin-bottom:6px;">Tier: {tier.upper()}</div>
  <div style="font-size:22px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">{cfg['headline']}</div>
</div>
<p style="font-size:14px;color:rgba(255,255,255,0.75);line-height:1.65;margin:0 0 24px;">{cfg['body']}</p>
<div style="text-align:center;padding:8px 0 4px;">
  <a href="{cta_url}" style="display:inline-block;background:{BRAND_COLOR};color:{BRAND_DARK};padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:13px;">{cfg['cta_label']}</a>
</div>
"""
    return subject, _base_layout(body, preheader=cfg["headline"])


def installment_due_email(name: str, installment_num: int, total: int, amount: float,
                           checkout_url: str, due_date_str: str) -> tuple[str, str]:
    """Email prompting user to pay next installment."""
    remaining = total - installment_num + 1
    subject = f"Rate {installment_num}/{total} fällig — {amount:.2f} € · Accelerator bleibt aktiv"
    body = f"""
<div style="background:linear-gradient(135deg,rgba(191,255,0,0.12),rgba(154,204,0,0.04));border:1px solid rgba(191,255,0,0.2);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
  <div style="font-size:10px;letter-spacing:0.2em;color:{BRAND_COLOR};font-weight:800;text-transform:uppercase;margin-bottom:6px;">Leadership Accelerator · Ratenzahlung</div>
  <div style="font-size:22px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">Hallo {name}, deine Rate {installment_num}/{total} steht an.</div>
</div>
<p style="font-size:14px;color:rgba(255,255,255,0.75);line-height:1.65;margin:0 0 16px;">
Danke, dass du den Accelerator-Weg gehst. Deine heutige Rate ist fällig:
</p>
<table role="presentation" width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;margin-bottom:24px;"><tr>
<td style="padding:6px 0;"><div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Betrag</div><div style="font-size:22px;font-weight:900;color:{BRAND_COLOR};">{amount:.2f} €</div></td>
<td style="padding:6px 0;text-align:right;"><div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Fällig</div><div style="font-size:13px;font-weight:700;">{due_date_str}</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;">{remaining} Raten verbleibend</div></td>
</tr></table>
<div style="text-align:center;padding:8px 0 4px;">
  <a href="{checkout_url}" style="display:inline-block;background:{BRAND_COLOR};color:{BRAND_DARK};padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:13px;">Jetzt Rate bezahlen</a>
</div>
<p style="font-size:11px;color:rgba(255,255,255,0.3);margin:20px 0 0;text-align:center;">Fragen zur Rate? Einfach auf diese Email antworten.</p>
"""
    return subject, _base_layout(body, preheader=f"Rate {installment_num}/{total} · {amount:.2f} € fällig")


# ── Monthly Leadership Scorecard (Accelerator-only) ─────────────────────────

def monthly_scorecard_email(
    name: str,
    xp_delta: int,
    challenge_days_delta: int,
    ls: int,
    eq: int,
    comm: int,
    overall: int,
    top_insight: str,
    next_focus: str,
    app_url: str = "https://leader-os.de",
) -> tuple[str, str]:
    """Generate the monthly Accelerator scorecard email."""
    month_label = datetime.now().strftime("%B %Y")
    subject = f"Dein Leadership-Monat {month_label} · Score {overall}/100"
    dashboard_url = f"{app_url.rstrip('/')}/my-path"

    body = f"""
<div style="background:linear-gradient(135deg,rgba(191,255,0,0.15),rgba(154,204,0,0.04));border:1px solid rgba(191,255,0,0.25);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
  <div style="font-size:10px;letter-spacing:0.2em;color:{BRAND_COLOR};font-weight:800;text-transform:uppercase;margin-bottom:6px;">Scorecard · {month_label}</div>
  <div style="font-size:22px;font-weight:900;line-height:1.25;letter-spacing:-0.02em;">Hallo {name}, so lief dein Monat.</div>
</div>

<table role="presentation" width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;margin-bottom:16px;">
  <tr>
    <td style="padding:6px 0;text-align:center;">
      <div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">XP</div>
      <div style="font-size:24px;font-weight:900;color:{BRAND_COLOR};">+{xp_delta}</div>
    </td>
    <td style="padding:6px 0;text-align:center;">
      <div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Challenge-Tage</div>
      <div style="font-size:24px;font-weight:900;color:#fff;">+{challenge_days_delta}</div>
    </td>
    <td style="padding:6px 0;text-align:center;">
      <div style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.35);font-weight:800;text-transform:uppercase;margin-bottom:4px;">Overall</div>
      <div style="font-size:24px;font-weight:900;color:{BRAND_COLOR};">{overall}<span style="font-size:13px;color:rgba(255,255,255,0.45);">/100</span></div>
    </td>
  </tr>
</table>

<h3 style="font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin:24px 0 12px;">3-Layer Analyse</h3>
<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;margin-bottom:24px;">
  <div style="margin-bottom:12px;"><div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;">KI-Kompetenz</div><div style="height:6px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;"><div style="height:100%;width:{ls}%;background:{BRAND_COLOR};"></div></div></div>
  <div style="margin-bottom:12px;"><div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Boardroom-Rhetorik</div><div style="height:6px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;"><div style="height:100%;width:{comm}%;background:#00AAFF;"></div></div></div>
  <div><div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Strategisches EQ</div><div style="height:6px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;"><div style="height:100%;width:{eq}%;background:#FFB800;"></div></div></div>
</div>

<div style="background:rgba(191,255,0,0.05);border:1px solid rgba(191,255,0,0.15);border-radius:14px;padding:16px 20px;margin-bottom:16px;">
  <div style="font-size:9px;letter-spacing:0.15em;color:{BRAND_COLOR};font-weight:800;text-transform:uppercase;margin-bottom:6px;">Dein Insight des Monats</div>
  <p style="font-size:14px;color:#fff;margin:0;line-height:1.5;">{top_insight}</p>
</div>

<div style="background:rgba(255,184,0,0.05);border:1px solid rgba(255,184,0,0.15);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
  <div style="font-size:9px;letter-spacing:0.15em;color:#FFB800;font-weight:800;text-transform:uppercase;margin-bottom:6px;">Fokus für den nächsten Monat</div>
  <p style="font-size:14px;color:rgba(255,255,255,0.85);margin:0;line-height:1.5;">{next_focus}</p>
</div>

<div style="text-align:center;padding:8px 0 4px;">
  <a href="{dashboard_url}" style="display:inline-block;background:{BRAND_COLOR};color:{BRAND_DARK};padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:13px;">Detail-Analyse ansehen</a>
</div>
"""
    return subject, _base_layout(body, preheader=f"Score {overall}/100 · +{xp_delta} XP · {top_insight[:80]}")

