"""Folders — Wingman-style knowledge organization for video missions + chats.

Vision (Mert Iter 92.23.7):
    "create folders. which also gives context and the knowledge is always
    used something like wingman.com but for leaders, like openclaw so the
    agent who is then always next to you."

Concept:
    - A user creates folders ("Boardroom Pitches", "Team-Meetings 2026", …).
    - Each folder holds references to items (video missions, chat sessions,
      notes) that share a context.
    - Each folder has a `context_summary` — a short prompt-injected snippet
      that travels with every interaction inside the folder so the LLM
      remembers the goal/stakeholders/constraints without the user repeating
      themselves.

Data model:
    db.folders                {folder_id, user_id, name, color, icon,
                               context_summary, created_at, updated_at}
    db.folder_items           {item_id, folder_id, user_id, item_type,
                               source_id, title, created_at}
        item_type ∈ {video_mission, chat_session, note}

Public endpoints (all owner-only):
    GET    /api/folders                       — list mine
    POST   /api/folders                       — create
    PATCH  /api/folders/{folder_id}           — rename, recolor, update context
    DELETE /api/folders/{folder_id}           — remove + un-link items
    POST   /api/folders/{folder_id}/items     — link an item
    DELETE /api/folders/{folder_id}/items/{item_id} — unlink
    GET    /api/folders/{folder_id}/items     — list contents
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional, Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from config import db
from services import get_current_user

router = APIRouter(prefix="/api/folders", tags=["folders"])


# ── Schemas ────────────────────────────────────────────────────────────────
class FolderIn(BaseModel):
    name: str
    color: Optional[str] = "#BFFF00"
    icon: Optional[str] = "folder"
    context_summary: Optional[str] = ""


class FolderUpdateIn(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    context_summary: Optional[str] = None


class FolderItemIn(BaseModel):
    item_type: Literal["video_mission", "chat_session", "note"]
    source_id: str
    title: Optional[str] = ""


# ── Helpers ────────────────────────────────────────────────────────────────
async def _own_folder(folder_id: str, user_id: str) -> dict:
    folder = await db.folders.find_one({"folder_id": folder_id, "user_id": user_id}, {"_id": 0})
    if not folder:
        raise HTTPException(status_code=404, detail="Ordner nicht gefunden")
    return folder


# ── Routes ─────────────────────────────────────────────────────────────────
@router.get("")
async def list_folders(request: Request):
    """List my folders newest-first with item counts injected."""
    user = await get_current_user(request)
    folders = await db.folders.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("updated_at", -1).to_list(200)

    if folders:
        folder_ids = [f["folder_id"] for f in folders]
        pipeline = [
            {"$match": {"folder_id": {"$in": folder_ids}}},
            {"$group": {"_id": "$folder_id", "count": {"$sum": 1}}},
        ]
        counts = {doc["_id"]: doc["count"] async for doc in db.folder_items.aggregate(pipeline)}
        for f in folders:
            f["item_count"] = counts.get(f["folder_id"], 0)
    return folders


@router.post("")
async def create_folder(payload: FolderIn, request: Request):
    user = await get_current_user(request)
    name = (payload.name or "").strip()[:120]
    if not name:
        raise HTTPException(status_code=400, detail="Name darf nicht leer sein")
    now = datetime.now(timezone.utc).isoformat()
    folder = {
        "folder_id": f"fld_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "name": name,
        "color": (payload.color or "#BFFF00")[:12],
        "icon": (payload.icon or "folder")[:40],
        "context_summary": (payload.context_summary or "").strip()[:2000],
        "created_at": now,
        "updated_at": now,
    }
    await db.folders.insert_one(dict(folder))
    folder["item_count"] = 0
    return folder


@router.patch("/{folder_id}")
async def update_folder(folder_id: str, payload: FolderUpdateIn, request: Request):
    user = await get_current_user(request)
    await _own_folder(folder_id, user["user_id"])
    updates: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if payload.name is not None:
        name = payload.name.strip()[:120]
        if not name:
            raise HTTPException(status_code=400, detail="Name darf nicht leer sein")
        updates["name"] = name
    if payload.color is not None:
        updates["color"] = payload.color[:12]
    if payload.icon is not None:
        updates["icon"] = payload.icon[:40]
    if payload.context_summary is not None:
        updates["context_summary"] = payload.context_summary.strip()[:2000]
    await db.folders.update_one({"folder_id": folder_id, "user_id": user["user_id"]}, {"$set": updates})
    return await _own_folder(folder_id, user["user_id"])


@router.delete("/{folder_id}")
async def delete_folder(folder_id: str, request: Request):
    user = await get_current_user(request)
    await _own_folder(folder_id, user["user_id"])
    await db.folders.delete_one({"folder_id": folder_id, "user_id": user["user_id"]})
    # Best-effort: unlink items (we don't delete the underlying video/chat).
    await db.folder_items.delete_many({"folder_id": folder_id, "user_id": user["user_id"]})
    # Also clear folder_id off video_challenges entries pointing here.
    await db.video_challenges.update_many(
        {"folder_id": folder_id, "user_id": user["user_id"]},
        {"$unset": {"folder_id": ""}},
    )
    return {"deleted": True}


@router.get("/{folder_id}/items")
async def list_items(folder_id: str, request: Request):
    user = await get_current_user(request)
    await _own_folder(folder_id, user["user_id"])
    items = await db.folder_items.find(
        {"folder_id": folder_id, "user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return items


@router.post("/{folder_id}/items")
async def add_item(folder_id: str, payload: FolderItemIn, request: Request):
    user = await get_current_user(request)
    await _own_folder(folder_id, user["user_id"])

    # Dedupe: if the same source_id is already in this folder, return existing.
    existing = await db.folder_items.find_one(
        {"folder_id": folder_id, "user_id": user["user_id"], "source_id": payload.source_id},
        {"_id": 0},
    )
    if existing:
        return existing

    item = {
        "item_id": f"fi_{uuid.uuid4().hex[:12]}",
        "folder_id": folder_id,
        "user_id": user["user_id"],
        "item_type": payload.item_type,
        "source_id": payload.source_id,
        "title": (payload.title or "").strip()[:200],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.folder_items.insert_one(dict(item))

    # Convenience: also stamp the folder_id directly on the underlying video
    # challenge entry so studio sidebar can filter by folder without a join.
    if payload.item_type == "video_mission":
        await db.video_challenges.update_one(
            {"entry_id": payload.source_id, "user_id": user["user_id"]},
            {"$set": {"folder_id": folder_id}},
        )

    # Bump folder updated_at so the sidebar shows the most-recently-active first.
    await db.folders.update_one(
        {"folder_id": folder_id, "user_id": user["user_id"]},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return item


@router.delete("/{folder_id}/items/{item_id}")
async def remove_item(folder_id: str, item_id: str, request: Request):
    user = await get_current_user(request)
    await _own_folder(folder_id, user["user_id"])
    item = await db.folder_items.find_one(
        {"item_id": item_id, "folder_id": folder_id, "user_id": user["user_id"]},
        {"_id": 0},
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item nicht im Ordner")
    await db.folder_items.delete_one({"item_id": item_id})
    if item.get("item_type") == "video_mission":
        await db.video_challenges.update_one(
            {"entry_id": item.get("source_id"), "user_id": user["user_id"]},
            {"$unset": {"folder_id": ""}},
        )
    return {"removed": True}
