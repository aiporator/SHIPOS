"""Free Video-Analyse Trial — 3 gratis Analysen für Free + Standard in den ersten 14 Tagen.

Free + Standard Users bekommen 3 kostenlose Video-Analysen innerhalb der ersten
14 Tage nach Registrierung. Danach normales Paywall-Verhalten (Accelerator).
Accelerator-User haben weiterhin unbegrenzten Zugang.

Bonus-Mechanik: Beim Kauf von Leadership-OS (Standard / €997) bekommt der User
einen Trial-Reset + 2 zusätzliche Bonus-Analysen, damit der Käufer sofort wieder
mit dem Feature arbeiten kann ohne auf Accelerator upzugraden.
"""
from datetime import datetime, timezone, timedelta

from config import db

TRIAL_DAYS = 14
TRIAL_VIDEO_LIMIT = 3
TRIAL_ELIGIBLE_TIERS = {"free", "starter", "standard"}

# Bonus given on tier upgrade to Standard / leadership_os (€997 plan).
# Resets `video_trial_used` and grants this many additional analyses on top of any
# remaining trial uses. Total: 3 (base trial) reset + 2 bonus = 5 fresh analyses.
STANDARD_PURCHASE_BONUS = 2


def _parse_dt(value):
    """Parse ISO datetime stored on user.created_at; tolerate already-parsed datetimes."""
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except ValueError:
            return None
    return None


async def get_video_trial_status(user: dict, current_tier: str) -> dict:
    """Returns trial status for the user's video analysis quota.

    {
      eligible: bool,           # tier qualifies for trial
      active: bool,             # within 14-day window AND has remaining uses
      used: int,                # how many trial analyses consumed
      remaining: int,           # TRIAL_VIDEO_LIMIT - used (>= 0)
      total: int,               # TRIAL_VIDEO_LIMIT
      days_left: int | None,    # whole days remaining in 14-day window, 0 if expired
      window_expired: bool,     # True if account is older than 14 days
    }
    """
    if current_tier == "accelerator":
        return {
            "eligible": False, "active": False, "used": 0,
            "remaining": 0, "total": TRIAL_VIDEO_LIMIT,
            "days_left": None, "window_expired": False,
            "reason": "accelerator_unlimited",
        }
    if current_tier not in TRIAL_ELIGIBLE_TIERS:
        return {
            "eligible": False, "active": False, "used": 0,
            "remaining": 0, "total": TRIAL_VIDEO_LIMIT,
            "days_left": None, "window_expired": False,
            "reason": "tier_not_eligible",
        }

    created = _parse_dt(user.get("created_at"))
    if not created:
        # Defensive: missing timestamp → treat as fresh account
        created = datetime.now(timezone.utc)
    # Use the purchase date as the new window start if user is on standard tier
    # AND has a `video_trial_reset_at` flag from their purchase event.
    reset_at = _parse_dt(user.get("video_trial_reset_at"))
    window_start = reset_at if (reset_at and reset_at > created) else created

    now = datetime.now(timezone.utc)
    deadline = window_start + timedelta(days=TRIAL_DAYS)
    window_expired = now > deadline
    days_left = max(0, (deadline - now).days) if not window_expired else 0

    bonus = int(user.get("video_trial_bonus", 0))
    effective_limit = TRIAL_VIDEO_LIMIT + bonus
    used = int(user.get("video_trial_used", 0))
    remaining = max(0, effective_limit - used)
    active = (not window_expired) and remaining > 0

    return {
        "eligible": True, "active": active, "used": used,
        "remaining": remaining, "total": effective_limit,
        "bonus": bonus, "base_total": TRIAL_VIDEO_LIMIT,
        "days_left": days_left, "window_expired": window_expired,
        "reason": "ok" if active else ("expired" if window_expired else "limit_reached"),
    }


async def consume_video_trial(user_id: str) -> int:
    """Atomically increment trial counter. Returns new count."""
    res = await db.users.find_one_and_update(
        {"user_id": user_id},
        {"$inc": {"video_trial_used": 1},
         "$set": {"video_trial_last_used_at": datetime.now(timezone.utc).isoformat()}},
        return_document=True, projection={"_id": 0, "video_trial_used": 1},
    )
    return int((res or {}).get("video_trial_used", 0))


async def grant_standard_purchase_bonus(user_id: str) -> dict:
    """Called from the payment-success path when a user buys leadership_os (€997).

    Resets the trial counter (used → 0), sets a fresh 14-day window starting NOW,
    and adds STANDARD_PURCHASE_BONUS extra analyses on top.

    Idempotent: if `video_trial_purchase_bonus_granted` is already truthy on the user,
    this is a no-op so refunds + re-purchases don't keep stacking the bonus.
    """
    now = datetime.now(timezone.utc).isoformat()
    res = await db.users.find_one_and_update(
        {"user_id": user_id, "video_trial_purchase_bonus_granted": {"$ne": True}},
        {"$set": {
            "video_trial_used": 0,
            "video_trial_bonus": STANDARD_PURCHASE_BONUS,
            "video_trial_reset_at": now,
            "video_trial_purchase_bonus_granted": True,
            "video_trial_purchase_bonus_granted_at": now,
        }},
        return_document=True,
        projection={"_id": 0, "video_trial_used": 1, "video_trial_bonus": 1},
    )
    if res is None:
        return {"granted": False, "reason": "already_granted_or_user_not_found"}
    return {"granted": True, "used": 0, "bonus": STANDARD_PURCHASE_BONUS,
            "total": TRIAL_VIDEO_LIMIT + STANDARD_PURCHASE_BONUS}
