"""Free Video-Analyse Trial — 3 gratis Analysen für Free + Standard in den ersten 14 Tagen.

Free + Standard Users bekommen 3 kostenlose Video-Analysen innerhalb der ersten
14 Tage nach Registrierung. Danach normales Paywall-Verhalten (Accelerator).
Accelerator-User haben weiterhin unbegrenzten Zugang.
"""
from datetime import datetime, timezone, timedelta

from config import db

TRIAL_DAYS = 14
TRIAL_VIDEO_LIMIT = 3
TRIAL_ELIGIBLE_TIERS = {"free", "starter", "standard"}


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
    now = datetime.now(timezone.utc)
    deadline = created + timedelta(days=TRIAL_DAYS)
    window_expired = now > deadline
    days_left = max(0, (deadline - now).days) if not window_expired else 0

    used = int(user.get("video_trial_used", 0))
    remaining = max(0, TRIAL_VIDEO_LIMIT - used)
    active = (not window_expired) and remaining > 0

    return {
        "eligible": True, "active": active, "used": used,
        "remaining": remaining, "total": TRIAL_VIDEO_LIMIT,
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
