"""Lightweight A/B-test tracking — Fake-Wlad-Call (and other CRO experiments).

Each user is assigned a stable variant on first encounter (via session/user_id
hashed into 100 buckets), then we log every event (impression, accept, decline,
bribe_redeemed). Read-side: `/api/ab/results/{experiment}` shows live conversion
deltas with sample size + significance.

Design notes:
  - No external dep — pure MongoDB. We're not Optimizely.
  - Bucket assignment is deterministic (hash(user_id + experiment) % 100)
    so the same user always sees the same variant across sessions.
  - Frontend can hit `/api/ab/assign/{experiment}` to ask "which variant am I?"
"""
import hashlib
import math
from datetime import datetime, timezone
from typing import Literal
from fastapi import APIRouter, Request
from pydantic import BaseModel
from config import db
from services import get_current_user
from routes.admin import require_admin

router = APIRouter(prefix="/api/ab", tags=["ab-testing"])


# ── Experiment registry ──────────────────────────────────────────────────────
# `split` is the % of users that get the TREATMENT (variant B).
EXPERIMENTS: dict[str, dict] = {
    "fake_wlad_call_bribe": {
        "variants": ["control", "bribe"],
        "split": 50,  # 50% control / 50% bribe
        "description": (
            "Fake-Wlad-Call: control = no incentive. bribe = a 10% LeaderOS "
            "coaching discount code is revealed in the call overlay (visible "
            "during the call, redeemable in checkout)."
        ),
    },
}


def _bucket(user_id: str, experiment: str) -> int:
    """Deterministic 0-99 bucket for (user_id, experiment) pair.
    SHA-256 is used (not for security — just a stable hash to map user IDs
    to 100 buckets). `usedforsecurity=False` documents this explicitly.
    """
    h = hashlib.sha256(f"{user_id}|{experiment}".encode(), usedforsecurity=False).hexdigest()
    return int(h[:8], 16) % 100


def assign_variant(user_id: str, experiment: str) -> str:
    """Return the variant label for this user. Idempotent."""
    spec = EXPERIMENTS.get(experiment)
    if not spec:
        return "control"
    bucket = _bucket(user_id, experiment)
    return spec["variants"][1] if bucket < spec["split"] else spec["variants"][0]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/assign/{experiment}")
async def ab_assign(experiment: str, request: Request):
    """Frontend asks: which variant am I in? Logs an `impression` exactly once."""
    user = await get_current_user(request)
    user_id = user["user_id"]
    spec = EXPERIMENTS.get(experiment)
    if not spec:
        return {"variant": "control", "experiment": experiment, "enrolled": False}

    variant = assign_variant(user_id, experiment)

    # Log impression exactly once per (user, experiment)
    await db.ab_assignments.update_one(
        {"user_id": user_id, "experiment": experiment},
        {
            "$setOnInsert": {
                "variant": variant,
                "assigned_at": datetime.now(timezone.utc).isoformat(),
            },
        },
        upsert=True,
    )
    return {"variant": variant, "experiment": experiment, "enrolled": True}


class ABEventBody(BaseModel):
    event: Literal["impression", "accept", "decline", "bribe_redeemed", "conversion"]
    meta: dict | None = None


@router.post("/event/{experiment}")
async def ab_event(experiment: str, body: ABEventBody, request: Request):
    """Frontend logs an outcome event (accept / decline / bribe_redeemed / conversion)."""
    user = await get_current_user(request)
    user_id = user["user_id"]
    if experiment not in EXPERIMENTS:
        return {"ok": False, "error": "unknown experiment"}

    variant = assign_variant(user_id, experiment)
    await db.ab_events.insert_one({
        "user_id": user_id,
        "experiment": experiment,
        "variant": variant,
        "event": body.event,
        "meta": body.meta or {},
        "ts": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True, "variant": variant}


def _wilson_lower(successes: int, total: int) -> float:
    """Wilson lower bound (95% confidence) for a binomial proportion.
    Avoids the trap of high-variance small-sample conversion deltas.
    """
    if total == 0:
        return 0.0
    z = 1.96
    p = successes / total
    denom = 1 + z * z / total
    centre = p + z * z / (2 * total)
    err = z * math.sqrt(p * (1 - p) / total + z * z / (4 * total * total))
    return max(0.0, (centre - err) / denom)


@router.get("/results/{experiment}")
async def ab_results(experiment: str, request: Request):
    """Admin-only: live conversion-rate dashboard for an experiment."""
    await require_admin(request)
    spec = EXPERIMENTS.get(experiment)
    if not spec:
        return {"error": "unknown experiment"}

    pipeline = [
        {"$match": {"experiment": experiment}},
        {"$group": {
            "_id": {"variant": "$variant", "event": "$event"},
            "count": {"$sum": 1},
        }},
    ]
    counts: dict[str, dict[str, int]] = {v: {} for v in spec["variants"]}
    async for row in db.ab_events.aggregate(pipeline):
        v = row["_id"]["variant"]
        e = row["_id"]["event"]
        counts.setdefault(v, {})[e] = row["count"]

    # Sample sizes from assignments (more reliable than impression events)
    impressions: dict[str, int] = {}
    async for row in db.ab_assignments.aggregate([
        {"$match": {"experiment": experiment}},
        {"$group": {"_id": "$variant", "n": {"$sum": 1}}},
    ]):
        impressions[row["_id"]] = row["n"]

    results = []
    for v in spec["variants"]:
        n = impressions.get(v, 0)
        accepts = counts.get(v, {}).get("accept", 0)
        declines = counts.get(v, {}).get("decline", 0)
        bribes = counts.get(v, {}).get("bribe_redeemed", 0)
        conversions = counts.get(v, {}).get("conversion", 0)
        acceptance = accepts / n if n else 0.0
        conversion_rate = conversions / n if n else 0.0
        results.append({
            "variant": v,
            "impressions": n,
            "accepts": accepts,
            "declines": declines,
            "bribe_redeemed": bribes,
            "conversions": conversions,
            "acceptance_rate": round(acceptance, 4),
            "conversion_rate": round(conversion_rate, 4),
            "acceptance_lower_95": round(_wilson_lower(accepts, n), 4),
            "conversion_lower_95": round(_wilson_lower(conversions, n), 4),
        })

    return {
        "experiment": experiment,
        "description": spec["description"],
        "results": results,
    }
