"""Task routes."""
from fastapi import APIRouter, HTTPException, Request
import uuid
from datetime import datetime, timezone

from config import db, logger
from models import TaskCreate, TaskUpdate
from services import get_current_user
from services_actions import record_user_action

router = APIRouter(prefix="/api", tags=["tasks"])


@router.get("/tasks")
async def get_tasks(request: Request):
    user = await get_current_user(request)
    return await db.tasks.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


@router.post("/tasks")
async def create_task(data: TaskCreate, request: Request):
    user = await get_current_user(request)
    task_id = f"task_{uuid.uuid4().hex[:12]}"
    doc = {
        "task_id": task_id, "user_id": user["user_id"], "title": data.title,
        "description": data.description, "category": data.category, "priority": data.priority,
        "status": "pending", "source": "manual", "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.tasks.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@router.put("/tasks/{task_id}")
async def update_task(task_id: str, data: TaskUpdate, request: Request):
    user = await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.tasks.update_one({"task_id": task_id, "user_id": user["user_id"]}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    if update_data.get("status") == "completed":
        await record_user_action(user["user_id"], "task_completed", metadata={"task_id": task_id})
    task = await db.tasks.find_one({"task_id": task_id}, {"_id": 0})
    return task


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.tasks.delete_one({"task_id": task_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}
