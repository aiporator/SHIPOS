"""Community routes — Facebook-group-style posts, likes, comments."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

from config import db
from services import get_current_user
from services_actions import record_user_action

router = APIRouter(prefix="/api/community", tags=["community"])


class PostIn(BaseModel):
    content: str
    category: Optional[str] = "general"  # general | question | win | challenge


class CommentIn(BaseModel):
    content: str


@router.get("/feed")
async def get_feed(request: Request, category: Optional[str] = None, limit: int = 50):
    """Return latest posts with author info + comment count + like status."""
    user = await get_current_user(request)
    query = {}
    if category and category != "all":
        query["category"] = category
    posts = await db.community_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    # Enrich with author info
    user_ids = list({p["user_id"] for p in posts})
    users = {
        u["user_id"]: u
        for u in await db.users.find(
            {"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "tier": 1, "level": 1}
        ).to_list(500)
    }
    # Enrich with comment counts — batched aggregation to avoid N+1 query
    post_ids = [p["post_id"] for p in posts]
    comment_counts = {}
    if post_ids:
        agg = db.community_comments.aggregate([
            {"$match": {"post_id": {"$in": post_ids}}},
            {"$group": {"_id": "$post_id", "count": {"$sum": 1}}},
        ])
        comment_counts = {doc["_id"]: doc["count"] async for doc in agg}
    for p in posts:
        author = users.get(p["user_id"], {})
        p["author_name"] = author.get("name", "Leader")
        p["author_picture"] = author.get("picture")
        p["author_tier"] = author.get("tier", "free")
        p["author_level"] = author.get("level", "")
        p["comment_count"] = comment_counts.get(p["post_id"], 0)
        p["liked_by_me"] = user["user_id"] in (p.get("likes") or [])
        p["likes_count"] = len(p.get("likes") or [])
        p.pop("likes", None)
    return posts


@router.post("/posts")
async def create_post(data: PostIn, request: Request):
    user = await get_current_user(request)
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Content darf nicht leer sein")
    if len(data.content) > 4000:
        raise HTTPException(status_code=400, detail="Post zu lang (max 4000 Zeichen)")
    post = {
        "post_id": f"p_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "content": data.content.strip(),
        "category": data.category or "general",
        "likes": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.community_posts.insert_one(dict(post))
    # Award XP + log activity via central registry (single source of truth).
    await record_user_action(
        user["user_id"],
        "community_post",
        metadata={"post_id": post["post_id"], "category": post["category"]},
    )
    post["author_name"] = user.get("name", "Leader")
    post["author_picture"] = user.get("picture")
    post["author_tier"] = user.get("tier", "free")
    post["comment_count"] = 0
    post["liked_by_me"] = False
    post["likes_count"] = 0
    return post


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, request: Request):
    user = await get_current_user(request)
    post = await db.community_posts.find_one({"post_id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post nicht gefunden")
    if post["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Nur der Ersteller darf löschen")
    await db.community_posts.delete_one({"post_id": post_id})
    await db.community_comments.delete_many({"post_id": post_id})
    return {"deleted": True}


@router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, request: Request):
    user = await get_current_user(request)
    post = await db.community_posts.find_one({"post_id": post_id}, {"_id": 0, "likes": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Post nicht gefunden")
    likes = post.get("likes") or []
    if user["user_id"] in likes:
        likes.remove(user["user_id"])
        liked = False
    else:
        likes.append(user["user_id"])
        liked = True
    await db.community_posts.update_one({"post_id": post_id}, {"$set": {"likes": likes}})
    return {"liked": liked, "likes_count": len(likes)}


@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, request: Request):
    await get_current_user(request)
    comments = await db.community_comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(200)
    user_ids = list({c["user_id"] for c in comments})
    users = {
        u["user_id"]: u
        for u in await db.users.find(
            {"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "tier": 1}
        ).to_list(500)
    }
    for c in comments:
        author = users.get(c["user_id"], {})
        c["author_name"] = author.get("name", "Leader")
        c["author_picture"] = author.get("picture")
        c["author_tier"] = author.get("tier", "free")
    return comments


@router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, data: CommentIn, request: Request):
    user = await get_current_user(request)
    post = await db.community_posts.find_one({"post_id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post nicht gefunden")
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Kommentar darf nicht leer sein")
    comment = {
        "comment_id": f"c_{uuid.uuid4().hex[:12]}",
        "post_id": post_id,
        "user_id": user["user_id"],
        "content": data.content.strip()[:2000],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.community_comments.insert_one(dict(comment))
    comment["author_name"] = user.get("name", "Leader")
    comment["author_picture"] = user.get("picture")
    comment["author_tier"] = user.get("tier", "free")
    return comment
