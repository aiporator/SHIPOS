"""File upload routes - Profile picture + file storage."""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Query
from fastapi.responses import Response
import uuid
from datetime import datetime, timezone

from config import db, logger
from services import get_current_user

# Migration → lib.object_storage. Native Backend: Supabase-Storage
# (Bucket `wladbot-uploads`) wenn SUPABASE_URL + SUPABASE_SERVICE_KEY
# in ENV. Sonst Legacy Emergent-Objstore. API ist identisch zum
# alten put_object/get_object — nur der Import schwenkt.
from lib.object_storage import put_object, get_object

router = APIRouter(prefix="/api", tags=["uploads"])

APP_NAME = "wladbot"

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.get("/uploads/health")
async def uploads_health():
    """Diagnostik — welcher Storage-Backend ist aktuell aktiv?
    Public, gibt keine Keys oder Bucket-Inhalte aus."""
    from lib.object_storage import health
    return health()


@router.post("/upload/profile-picture")
async def upload_profile_picture(request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request)

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Nur Bilder erlaubt (JPEG, PNG, WebP)")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Datei zu groß (max 5MB)")

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/profiles/{user['user_id']}/{uuid.uuid4().hex[:12]}.{ext}"

    try:
        result = put_object(path, data, file.content_type)
        storage_path = result.get("path", path)

        await db.files.insert_one({
            "file_id": f"file_{uuid.uuid4().hex[:12]}",
            "storage_path": storage_path,
            "user_id": user["user_id"],
            "file_type": "profile_picture",
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size": len(data),
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"picture": storage_path}})

        return {"path": storage_path, "size": len(data)}
    except Exception as e:
        logger.error(f"Profile picture upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload fehlgeschlagen: {str(e)}")


@router.get("/files/{path:path}")
async def serve_file(path: str, request: Request, auth: str = Query(None)):
    # Auth check - try cookie first, then query param
    try:
        await get_current_user(request)
    except HTTPException:
        if not auth:
            raise HTTPException(status_code=401, detail="Not authenticated")
        # Try query param auth
        from services import get_current_user as gcu
        class FakeRequest:
            def __init__(self, token):
                self.cookies = {}
                self.headers = {"Authorization": f"Bearer {token}"}
        try:
            await gcu(FakeRequest(auth))
        except Exception:
            raise HTTPException(status_code=401, detail="Not authenticated")

    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=record.get("content_type", content_type))
    except Exception as e:
        logger.error(f"File serve error: {e}")
        raise HTTPException(status_code=500, detail="File not found")
