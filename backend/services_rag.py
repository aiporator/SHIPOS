"""WladBot RAG — retrieval-augmented generation using Voyage embeddings + Supabase pgvector.

Architecture:
  1. User query → Voyage `voyage-3-large` embedding (1024-dim)
  2. Supabase RPC `match_documents` → top-k similar chunks from `wladbot_documents`
  3. Inject top chunks as additional context into the WladBot system prompt
  4. GPT-5.2 answers using Wlad's actual content, not just base knowledge

Graceful degradation:
  - Voyage key missing      → no retrieval, chat still works with base prompt
  - Supabase key invalid    → no retrieval, chat still works
  - match_documents fails   → no retrieval, chat still works
  - Empty/low-quality match → no retrieval, chat still works

  Every failure path logs a warning. Chat NEVER breaks because of RAG.

Cache: in-memory LRU keyed by query text (60s TTL) — saves Voyage tokens
on repeat questions.
"""
from __future__ import annotations

import logging
import os
import time
from typing import Any

import httpx

logger = logging.getLogger("leader-os.rag")

VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings"
# IMPORTANT: must match the model used to embed `wladbot_documents` (voyage-3, dim=1024).
# Using voyage-3-large here would give ~0.07 similarity (model mismatch).
VOYAGE_MODEL = "voyage-3"
EMBEDDING_DIM = 1024

# RAG tuning
MATCH_THRESHOLD = 0.60       # cosine similarity cutoff (0..1)
MATCH_COUNT = 6              # top-K chunks
MAX_CONTEXT_CHARS = 4000     # truncate injected context to keep prompt size sane
CACHE_TTL_SECONDS = 60       # in-memory cache for repeat queries
CACHE_MAX_ENTRIES = 256

# In-memory cache  → { query_text: (timestamp, chunks_list) }
_query_cache: dict[str, tuple[float, list[dict]]] = {}


def _is_configured() -> bool:
    """Both Voyage AND Supabase must be set for RAG to function."""
    return bool(os.environ.get("VOYAGE_API_KEY")) and bool(os.environ.get("SUPABASE_URL")) \
        and bool(os.environ.get("SUPABASE_SERVICE_KEY"))


async def _embed_query(query: str) -> list[float] | None:
    """Get the Voyage embedding for a user query. Returns None on any failure."""
    api_key = os.environ.get("VOYAGE_API_KEY")
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.post(
                VOYAGE_API_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "input": [query[:8000]],  # Voyage has token limits — truncate long queries
                    "model": VOYAGE_MODEL,
                    "input_type": "query",
                },
            )
            r.raise_for_status()
            return r.json()["data"][0]["embedding"]
    except Exception as e:
        logger.warning("RAG: Voyage embedding failed: %s", e)
        return None


async def _match_documents(embedding: list[float]) -> list[dict]:
    """Call Supabase RPC `match_documents` to find similar chunks.

    The RPC must accept: query_embedding (vector), match_threshold (float),
    match_count (int). Returns list of {id, content, similarity, metadata?}.

    Workaround: the deployed `match_wladbot_documents` RPC currently returns
    metadata=NULL even though the underlying column is populated. When this
    happens we backfill the metadata via a second batch read of the table.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not (url and key):
        return []
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.post(
                f"{url}/rest/v1/rpc/match_wladbot_documents",
                headers={
                    "apikey": key,
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "query_embedding": embedding,
                    "match_threshold": MATCH_THRESHOLD,
                    "match_count": MATCH_COUNT,
                },
            )
            if r.status_code != 200:
                logger.warning("RAG: Supabase match_documents HTTP %s — %s", r.status_code, r.text[:200])
                return []
            data = r.json()
            chunks = data if isinstance(data, list) else []

            # Backfill missing metadata (RPC bug → metadata is None on every row)
            missing_ids = [c["id"] for c in chunks if c.get("metadata") in (None, {})]
            if missing_ids:
                await _backfill_metadata(client, url, key, chunks, missing_ids)
            return chunks
    except Exception as e:
        logger.warning("RAG: Supabase match_documents call failed: %s", e)
        return []


async def _backfill_metadata(client, url: str, key: str,
                              chunks: list[dict], missing_ids: list[str]) -> None:
    """Fetch metadata for chunk IDs the RPC didn't populate, merge in place."""
    if not missing_ids:
        return
    # PostgREST `in.(a,b,c)` filter — UUIDs are safe
    in_clause = ",".join(missing_ids)
    try:
        r = await client.get(
            f"{url}/rest/v1/wladbot_documents?id=in.({in_clause})&select=id,metadata",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
        )
        if r.status_code != 200:
            return
        meta_by_id = {row["id"]: row.get("metadata") for row in r.json() if row.get("id")}
        for chunk in chunks:
            if chunk.get("metadata") in (None, {}):
                m = meta_by_id.get(chunk["id"])
                if m:
                    chunk["metadata"] = m
    except Exception as e:
        logger.debug("RAG: metadata backfill failed (non-fatal): %s", e)


def _format_chunks_for_prompt(chunks: list[dict]) -> str:
    """Format retrieved chunks into a single context block for the system prompt."""
    if not chunks:
        return ""
    lines = []
    total = 0
    for i, c in enumerate(chunks, 1):
        content = (c.get("content") or "").strip()
        if not content:
            continue
        snippet = f"[Quelle {i} · Relevanz {c.get('similarity', 0):.2f}]\n{content}"
        if total + len(snippet) > MAX_CONTEXT_CHARS:
            break
        lines.append(snippet)
        total += len(snippet)
    if not lines:
        return ""
    return (
        "\n\n=== WLAD-WISSEN (Auszüge aus den Original-Materialien — nutze diese als Wahrheits-Grundlage) ===\n"
        + "\n\n---\n\n".join(lines)
        + "\n=== ENDE WLAD-WISSEN ===\n"
    )


def _cache_get(query: str) -> list[dict] | None:
    rec = _query_cache.get(query)
    if not rec:
        return None
    ts, chunks = rec
    if time.time() - ts > CACHE_TTL_SECONDS:
        _query_cache.pop(query, None)
        return None
    return chunks


def _cache_put(query: str, chunks: list[dict]) -> None:
    if len(_query_cache) >= CACHE_MAX_ENTRIES:
        # Evict oldest 25% to keep things fresh & memory bounded
        sorted_keys = sorted(_query_cache, key=lambda k: _query_cache[k][0])
        for k in sorted_keys[: len(sorted_keys) // 4]:
            _query_cache.pop(k, None)
    _query_cache[query] = (time.time(), chunks)


async def retrieve_context(query: str) -> dict[str, Any]:
    """Top-level entry point. Returns:

        {
          "context_block": str,        # ready to append to system prompt (empty if no RAG)
          "chunks_count": int,         # 0 if no retrieval happened
          "rag_active": bool,          # True only if at least 1 chunk was injected
        }

    Caller is expected to do:
        ctx = await retrieve_context(user_message)
        system_prompt = BASE_SYSTEM + ctx["context_block"]
    """
    empty = {"context_block": "", "chunks_count": 0, "rag_active": False}
    if not query or len(query.strip()) < 3:
        return empty
    if not _is_configured():
        # Silent — this is the expected state before keys are configured.
        return empty

    # Cache check
    cached = _cache_get(query)
    if cached is not None:
        ctx_block = _format_chunks_for_prompt(cached)
        return {"context_block": ctx_block, "chunks_count": len(cached), "rag_active": bool(ctx_block)}

    embedding = await _embed_query(query)
    if not embedding:
        return empty
    chunks = await _match_documents(embedding)
    _cache_put(query, chunks)
    ctx_block = _format_chunks_for_prompt(chunks)
    if ctx_block:
        logger.info("RAG: injected %d chunks for query (len=%d)", len(chunks), len(query))
    return {"context_block": ctx_block, "chunks_count": len(chunks), "rag_active": bool(ctx_block)}


def rag_status() -> dict[str, Any]:
    """Health-check for /api/health or admin dashboards."""
    return {
        "configured": _is_configured(),
        "voyage_key_set": bool(os.environ.get("VOYAGE_API_KEY")),
        "supabase_key_set": bool(os.environ.get("SUPABASE_SERVICE_KEY")),
        "supabase_url_set": bool(os.environ.get("SUPABASE_URL")),
        "cache_size": len(_query_cache),
        "model": VOYAGE_MODEL,
        "dim": EMBEDDING_DIM,
        "match_threshold": MATCH_THRESHOLD,
        "match_count": MATCH_COUNT,
    }
