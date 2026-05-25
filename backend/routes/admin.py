"""Admin Panel — Enterprise leads, referral analytics, coaching conversions, community metrics."""
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone, timedelta

from config import db
from services import get_current_user
from services_tier import TIER_CONFIG

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Admin emails (expand as needed)
ADMIN_EMAILS = {"test@test.com", "start@aiporate.com", "mert@wladbot.com"}


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("email", "").lower() not in {e.lower() for e in ADMIN_EMAILS} and not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def _compute_user_stats(last_30: str, last_7: str) -> dict:
    return {
        "total": await db.users.count_documents({}),
        "new_30d": await db.users.count_documents({"created_at": {"$gte": last_30}}),
        "new_7d": await db.users.count_documents({"created_at": {"$gte": last_7}}),
    }


async def _compute_tier_distribution() -> dict:
    tier_dist: dict = {t: await db.users.count_documents({"tier": t}) for t in TIER_CONFIG.keys()}
    legacy_premium = await db.users.count_documents({"premium": True, "tier": {"$in": [None, "free"]}})
    if legacy_premium:
        tier_dist["legacy_premium"] = legacy_premium
    return tier_dist


async def _compute_revenue(last_30: str) -> dict:
    paid_txs = await db.payment_transactions.find(
        {"payment_status": "paid"},
        {"_id": 0, "amount": 1, "currency": 1, "created_at": 1, "package_id": 1, "tier": 1},
    ).to_list(5000)
    total_revenue = sum(t.get("amount", 0) for t in paid_txs)
    revenue_30d = sum(t.get("amount", 0) for t in paid_txs if t.get("created_at", "") >= last_30)
    revenue_per_tier: dict = {}
    for t in paid_txs:
        tier = t.get("tier", "unknown")
        revenue_per_tier[tier] = revenue_per_tier.get(tier, 0) + t.get("amount", 0)
    return {
        "total_eur": round(total_revenue, 2),
        "last_30d_eur": round(revenue_30d, 2),
        "per_tier": {k: round(v, 2) for k, v in revenue_per_tier.items()},
        "mrr_estimate_eur": round(revenue_30d, 2),
        "arr_estimate_eur": round(revenue_30d * 12, 2),
    }


async def _compute_community_stats(last_7: str) -> dict:
    return {
        "total_posts": await db.community_posts.count_documents({}),
        "posts_7d": await db.community_posts.count_documents({"created_at": {"$gte": last_7}}),
        "total_comments": await db.community_comments.count_documents({}),
    }


async def _compute_installments() -> dict:
    return {
        "active_plans": await db.installment_plans.count_documents({"active": True}),
        "completed_plans": await db.installment_plans.count_documents({"active": False}),
    }


@router.get("/overview")
async def admin_overview(request: Request) -> dict:
    """Top-level metrics for admin dashboard."""
    await require_admin(request)
    now = datetime.now(timezone.utc)
    last_30 = (now - timedelta(days=30)).isoformat()
    last_7 = (now - timedelta(days=7)).isoformat()

    enterprise_leads = await db.payment_transactions.count_documents({"package_id": "enterprise"})
    total_referrals = await db.referrals.count_documents({}) if "referrals" in await db.list_collection_names() else 0

    return {
        "users": await _compute_user_stats(last_30, last_7),
        "tier_distribution": await _compute_tier_distribution(),
        "revenue": await _compute_revenue(last_30),
        "installments": await _compute_installments(),
        "community": await _compute_community_stats(last_7),
        "enterprise_leads": enterprise_leads,
        "referrals": total_referrals,
    }


async def _gather_registration_counts(cutoff_24h_iso: str, cutoff_7d_iso: str) -> dict:
    """Registration counts for auth-health widget."""
    return {
        "registrations_24h": await db.users.count_documents({"created_at": {"$gte": cutoff_24h_iso}}),
        "registrations_7d": await db.users.count_documents({"created_at": {"$gte": cutoff_7d_iso}}),
    }


async def _gather_login_stats(cutoff_24h: datetime) -> dict:
    """Total / success / failed logins + success-rate % for last 24h."""
    total = await db.login_attempts.count_documents({"created_at": {"$gte": cutoff_24h}})
    failed = await db.login_attempts.count_documents({"created_at": {"$gte": cutoff_24h}, "success": False})
    success = total - failed
    rate = round((success / total * 100), 1) if total else 100.0
    return {"total": total, "success": success, "failed": failed, "success_rate_pct": rate}


async def _gather_top_offenders(cutoff_24h: datetime) -> list:
    """Top 10 (email, ip) combos with ≥5 failed logins — brute-force indicators."""
    pipeline = [
        {"$match": {"created_at": {"$gte": cutoff_24h}, "success": False}},
        {"$group": {"_id": {"ip": "$ip", "email": "$email"}, "count": {"$sum": 1}}},
        {"$match": {"count": {"$gte": 5}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "ip": "$_id.ip", "email": "$_id.email", "failed_count": "$count"}},
    ]
    return await db.login_attempts.aggregate(pipeline).to_list(10)


async def _count_rate_limit_triggers(cutoff_24h: datetime) -> int:
    """Count (email, ip) combos that hit the 10-fail threshold → would 429."""
    pipeline = [
        {"$match": {"created_at": {"$gte": cutoff_24h}, "success": False}},
        {"$group": {"_id": {"ip": "$ip", "email": "$email"}, "count": {"$sum": 1}}},
        {"$match": {"count": {"$gte": 10}}},
        {"$count": "rate_limited"},
    ]
    result = await db.login_attempts.aggregate(pipeline).to_list(1)
    return result[0]["rate_limited"] if result else 0


@router.get("/auth-health")
async def auth_health(request: Request) -> dict:
    """Auth metrics for launch monitoring — last 24h."""
    await require_admin(request)
    now = datetime.now(timezone.utc)
    cutoff_24h = now - timedelta(hours=24)
    cutoff_7d_iso = (now - timedelta(days=7)).isoformat()

    regs = await _gather_registration_counts(cutoff_24h.isoformat(), cutoff_7d_iso)
    logins = await _gather_login_stats(cutoff_24h)
    top_offenders = await _gather_top_offenders(cutoff_24h)
    rate_limit_triggers = await _count_rate_limit_triggers(cutoff_24h)

    return {
        "window_hours": 24,
        **regs,
        "logins_24h": logins,
        "rate_limit_triggers_24h": rate_limit_triggers,
        "duplicate_email_blocks_24h": 0,  # placeholder — future: explicit error log
        "top_offenders": top_offenders,
        "computed_at": now.isoformat(),
    }


@router.get("/users")
async def admin_users(request: Request, limit: int = 100):
    """List users with tier info for admin."""
    await require_admin(request)
    users = await db.users.find(
        {},
        {"_id": 0, "password_hash": 0, "login_history": 0, "signup_ip": 0}
    ).sort("created_at", -1).to_list(limit)
    return users


@router.get("/transactions")
async def admin_transactions(request: Request, limit: int = 100):
    """Recent payment transactions."""
    await require_admin(request)
    txs = await db.payment_transactions.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    return txs


@router.get("/enterprise-leads")
async def admin_enterprise_leads(request: Request):
    """Enterprise tier inquiries + paid."""
    await require_admin(request)
    leads = await db.payment_transactions.find(
        {"package_id": "enterprise"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return leads


@router.get("/referrals")
async def admin_referrals(request: Request):
    """Top referral codes by usage."""
    await require_admin(request)
    cols = await db.list_collection_names()
    if "referrals" not in cols:
        return []
    pipeline = [
        {"$group": {"_id": "$referrer_code", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 50},
    ]
    results = await db.referrals.aggregate(pipeline).to_list(50)
    return [{"code": r["_id"], "count": r["count"]} for r in results]


@router.get("/community/leaderboard")
async def community_leaderboard(request: Request, limit: int = 10):
    """Public — top Leaders by post count + likes. Not admin-only."""
    await get_current_user(request)
    pipeline = [
        {"$project": {
            "user_id": 1,
            "post_count": 1,
            "total_likes": {"$size": {"$ifNull": ["$likes", []]}},
        }},
        {"$group": {
            "_id": "$user_id",
            "post_count": {"$sum": 1},
            "total_likes": {"$sum": "$total_likes"},
        }},
        {"$sort": {"total_likes": -1, "post_count": -1}},
        {"$limit": limit},
    ]
    rows = await db.community_posts.aggregate(pipeline).to_list(limit)
    user_ids = [r["_id"] for r in rows]
    users = {
        u["user_id"]: u
        for u in await db.users.find(
            {"user_id": {"$in": user_ids}},
            {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "tier": 1, "level": 1, "xp": 1},
        ).to_list(limit)
    }
    result = []
    for r in rows:
        u = users.get(r["_id"], {})
        result.append({
            "user_id": r["_id"],
            "name": u.get("name", "Leader"),
            "picture": u.get("picture"),
            "tier": u.get("tier", "free"),
            "level": u.get("level", ""),
            "xp": u.get("xp", 0),
            "post_count": r["post_count"],
            "total_likes": r["total_likes"],
        })
    return result


# ─────────────────────────────────────────────────────────────────────────
# RAG Debug — see exactly which Wlad-chunks WladBot retrieves for any query.
# Critical tool to spot knowledge gaps in the 609-chunk corpus before users do.
# ─────────────────────────────────────────────────────────────────────────

@router.post("/rag-debug")
async def rag_debug(request: Request):
    """For a given query, return top-N chunks + similarity + metadata coverage.

    Body: { "query": str, "match_count": int=10, "match_threshold": float=0.0 }
    Returns:
      {
        query, model, embedding_dim,
        chunks: [{ id, content, similarity, metadata: {course, section, themes, layer} }],
        coverage: { courses, sections, themes, layers, top_score, avg_score, low_score_warning },
      }
    """
    await require_admin(request)
    body = await request.json()
    query = (body.get("query") or "").strip()
    if not query or len(query) < 3:
        raise HTTPException(status_code=400, detail="Query must be at least 3 characters")
    match_count = max(1, min(int(body.get("match_count", 10)), 30))
    match_threshold = max(0.0, min(float(body.get("match_threshold", 0.0)), 1.0))

    from services_rag import _embed_query, VOYAGE_MODEL, EMBEDDING_DIM
    import os
    import httpx

    embedding = await _embed_query(query)
    if not embedding:
        raise HTTPException(status_code=503, detail="Embedding service unavailable (Voyage)")

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not (url and key):
        raise HTTPException(status_code=503, detail="Supabase keys not configured")

    async with httpx.AsyncClient(timeout=12) as client:
        r = await client.post(
            f"{url}/rest/v1/rpc/match_wladbot_documents",
            headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"query_embedding": embedding, "match_threshold": match_threshold, "match_count": match_count},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Supabase RPC failed: {r.text[:200]}")

    chunks_raw = r.json() if isinstance(r.json(), list) else []

    # Build coverage breakdown
    courses: dict[str, int] = {}
    sections: dict[str, int] = {}
    themes: dict[str, int] = {}
    layers: dict[str, int] = {}
    similarities: list[float] = []
    chunks_out = []

    for c in chunks_raw:
        meta = c.get("metadata") or {}
        sim = float(c.get("similarity") or 0)
        similarities.append(sim)
        course = meta.get("course") or "unknown"
        section = meta.get("section") or "unknown"
        layer = str(meta.get("layer") or "unknown")
        chunk_themes = meta.get("themes") or []

        courses[course] = courses.get(course, 0) + 1
        sections[section] = sections.get(section, 0) + 1
        layers[layer] = layers.get(layer, 0) + 1
        for t in chunk_themes:
            themes[t] = themes.get(t, 0) + 1

        chunks_out.append({
            "id": c.get("id"),
            "similarity": round(sim, 4),
            "content": (c.get("content") or "")[:400],
            "metadata": {
                "course": course,
                "section": section,
                "layer": layer,
                "themes": chunk_themes,
            },
        })

    top_score = max(similarities) if similarities else 0
    avg_score = (sum(similarities) / len(similarities)) if similarities else 0

    # Heuristic warnings
    warnings = []
    if not chunks_out:
        warnings.append("ZERO_CHUNKS: query returned 0 chunks even at threshold=0.0 — embedding may be malformed.")
    elif top_score < 0.40:
        warnings.append(f"LOW_RELEVANCE: top similarity is only {top_score:.2f} — corpus likely lacks content for this topic. Consider adding source material.")
    elif top_score < 0.55:
        warnings.append(f"MEDIUM_RELEVANCE: top similarity {top_score:.2f} — answers will be loosely grounded. Stronger coverage would help.")

    return {
        "query": query,
        "model": VOYAGE_MODEL,
        "embedding_dim": EMBEDDING_DIM,
        "match_count": match_count,
        "match_threshold": match_threshold,
        "chunks": chunks_out,
        "coverage": {
            "courses": dict(sorted(courses.items(), key=lambda x: -x[1])),
            "sections": dict(sorted(sections.items(), key=lambda x: -x[1])[:8]),
            "themes": dict(sorted(themes.items(), key=lambda x: -x[1])[:15]),
            "layers": dict(sorted(layers.items(), key=lambda x: -x[1])),
            "top_score": round(top_score, 4),
            "avg_score": round(avg_score, 4),
            "chunks_returned": len(chunks_out),
        },
        "warnings": warnings,
    }


@router.get("/rag-corpus-stats")
async def rag_corpus_stats(request: Request):
    """Overview of the entire 609-chunk corpus — which courses are best covered."""
    await require_admin(request)
    import os
    import httpx

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not (url and key):
        raise HTTPException(status_code=503, detail="Supabase not configured")

    # Pull all metadata (lightweight — no embeddings, no content)
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(
            f"{url}/rest/v1/wladbot_documents?select=id,metadata&limit=2000",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Supabase fetch failed: {r.text[:200]}")

    rows = r.json() if isinstance(r.json(), list) else []
    courses: dict[str, int] = {}
    themes: dict[str, int] = {}
    layers: dict[str, int] = {}
    for row in rows:
        m = row.get("metadata") or {}
        course = m.get("course") or "unknown"
        courses[course] = courses.get(course, 0) + 1
        layers[str(m.get("layer") or "unknown")] = layers.get(str(m.get("layer") or "unknown"), 0) + 1
        for t in (m.get("themes") or []):
            themes[t] = themes.get(t, 0) + 1

    return {
        "total_chunks": len(rows),
        "courses": dict(sorted(courses.items(), key=lambda x: -x[1])),
        "layers": dict(sorted(layers.items(), key=lambda x: -x[1])),
        "top_themes": dict(sorted(themes.items(), key=lambda x: -x[1])[:30]),
        "unique_courses": len(courses),
        "unique_themes": len(themes),
    }

