"""Leader-Check landing intent capture.

The leader-os.de LeadCaptureModal (and any future popup that wants to
capture a lead) POSTs here with email + source + campaign. We upsert
into Supabase `incomplete_attempts` (the same table the leader-check.de
funnel writes to) so analytics + drip-emails stay unified by
`email_lower` across both surfaces.

The endpoint is intentionally permissive: an invalid email returns
422, anything else returns 200 even if downstream write fails — the
user's funnel must continue, the lead is best-effort.
"""
import logging
import os
import re

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/leader-check", tags=["leader-check"])

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class IntentPayload(BaseModel):
    email: str = Field(..., min_length=3, max_length=320)
    source: str = Field(default="unknown", max_length=64)
    campaign: str = Field(default="", max_length=64)


@router.post("/intent")
async def capture_intent(payload: IntentPayload):
    email = payload.email.strip().lower()
    if not EMAIL_RE.match(email):
        return {"ok": False, "error": "invalid_email"}

    if not SUPABASE_URL or not (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY):
        logger.warning("intent.capture: supabase not configured, dropping %s", email)
        return {"ok": True, "persisted": False}

    rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/upsert_incomplete_attempt"
    key = SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    body = {
        "p_email": email,
        "p_source_platform": "leader-os",
        "p_meta": {"source": payload.source, "campaign": payload.campaign},
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.post(rpc_url, json=body, headers=headers)
        if response.status_code >= 400:
            logger.warning("intent.capture: rpc %s failed: %s", rpc_url, response.text[:200])
            return {"ok": True, "persisted": False}
    except Exception as exc:
        logger.warning("intent.capture: rpc error: %s", exc)
        return {"ok": True, "persisted": False}

    return {"ok": True, "persisted": True}
