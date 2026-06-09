"""Central User-Action Registry + record_user_action() helper.

Purpose:
- Single source of truth for XP/score rewards per action type.
- Prevents routes from silently forgetting to log into activity_log.
- Pairs with routes/profile.py ACTION_META (which maps action keys to UI labels/icons).

Usage pattern in any route:
    from services_actions import record_user_action
    ...
    await record_user_action(user_id, "community_post", metadata={"post_id": pid})

The reward is looked up from ACTION_REWARDS; optional per-call overrides let you
boost specific cases (e.g. a perfect simulation score):
    await record_user_action(user_id, "simulation", xp_bonus=10, metadata={...})
"""
from __future__ import annotations
from typing import Optional
from services import update_user_scores


# ── Action Registry ─────────────────────────────────────────────────────────
# Keys must match ACTION_META keys in routes/profile.py for proper UI rendering.
# Values: (xp, leadership_delta, eq_delta, communication_delta)
# Adding a new action type? Add it here AND in profile.py ACTION_META.
ACTION_REWARDS: dict[str, tuple[int, int, int, int]] = {
    # Onboarding / auth
    "register":              (0,  0, 0, 0),
    "onboarding_completed":  (5,  0, 0, 0),

    # Daily practice
    "daily_checkin":         (10, 2, 2, 1),
    "chat_message":          (5,  0, 0, 1),
    "chat_session":          (5,  0, 0, 1),

    # Content creation & social
    "community_post":        (10, 1, 0, 2),
    "community_comment":     (3,  0, 1, 1),
    "community_like":        (1,  0, 0, 0),
    "social_share":          (15, 0, 0, 2),

    # Learning & skill building
    "mission_completed":     (15, 2, 1, 1),
    "playbook_completed":    (20, 3, 0, 2),
    "playbook_step":         (5,  1, 0, 1),
    "report_generated":      (15, 0, 0, 0),
    "tool_used":             (5,  0, 0, 1),
    "deep_assist":           (8,  1, 0, 2),

    # Challenges
    "challenge_day":         (20, 2, 1, 1),
    "challenger_interview":  (25, 2, 2, 3),
    "video_challenge":       (30, 3, 1, 4),
    "simulation":            (15, 2, 1, 2),

    # Task management
    "task_completed":        (10, 2, 0, 1),

    # Growth levers
    "referral_success":      (25, 1, 0, 2),
    "referral_used":         (10, 0, 0, 0),

    # Enterprise
    "enterprise_lead":       (30, 1, 0, 1),
    "enterprise_diagnosis":  (30, 2, 0, 2),

    # WladHub / scoring
    "wladhub_sync":              (5,  0, 0, 0),
    "wladhub_diagnosis_imported": (25, 0, 0, 0),  # per-call bonuses carry dynamic ls/eq/comm
    "wladhub_supabase_synced":   (15, 0, 0, 0),

    # Challenge30 (daily challenge days)
    "challenge30_day":           (20, 2, 1, 1),
    "challenge30_quiz":          (15, 1, 0, 1),

    # Deep/advanced challenge types
    "video_challenge_completed": (20, 0, 0, 0),  # per-call bonuses from score
    "simulation_completed":      (25, 0, 0, 0),  # per-call bonuses from score
    "challenge_completed":       (30, 0, 0, 0),  # per-call bonuses from score
}


async def record_user_action(
    user_id: str,
    action: str,
    metadata: Optional[dict] = None,
    xp_bonus: int = 0,
    leadership_bonus: int = 0,
    eq_bonus: int = 0,
    comm_bonus: int = 0,
) -> dict:
    """Log a user action — awards the registered reward + any per-call bonus.

    Returns the reward amounts that were applied (for testing/debugging).
    """
    if action not in ACTION_REWARDS:
        # Unknown action — log with zero rewards so it still shows in activity feed,
        # but surface the miss so developers notice.
        import logging
        logging.getLogger(__name__).warning(
            f"record_user_action: unknown action '{action}' — "
            f"add it to services_actions.ACTION_REWARDS + routes/profile.py ACTION_META"
        )
        xp, ls, eq, comm = (0, 0, 0, 0)
    else:
        xp, ls, eq, comm = ACTION_REWARDS[action]

    xp_total = xp + xp_bonus
    ls_total = ls + leadership_bonus
    eq_total = eq + eq_bonus
    comm_total = comm + comm_bonus

    await update_user_scores(
        user_id,
        xp_delta=xp_total,
        leadership_delta=ls_total,
        eq_delta=eq_total,
        comm_delta=comm_total,
        action=action,
        metadata=metadata or {},
    )
    return {
        "action": action,
        "xp": xp_total,
        "leadership": ls_total,
        "eq": eq_total,
        "communication": comm_total,
    }
