import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO = {"video/mp4", "video/quicktime", "video/webm"}
ALLOWED = ALLOWED_IMAGE | ALLOWED_VIDEO


async def save_file(file: UploadFile, subfolder: str = "complaints") -> dict:
    if file.content_type not in ALLOWED:
        raise HTTPException(400, f"File type {file.content_type} not allowed")
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Max file size is {settings.MAX_FILE_SIZE_MB}MB")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    name = f"{uuid.uuid4().hex}.{ext}"
    folder = Path(settings.UPLOAD_DIR) / subfolder
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / name
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    return {
        "file_path": str(path),
        "file_name": file.filename,
        "file_type": "image" if file.content_type in ALLOWED_IMAGE else "video",
        "file_size": len(content),
    }
