import os
import uuid

import aiofiles
from fastapi import HTTPException, UploadFile

from app.core.config import settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _sniff_extension(head: bytes) -> str | None:
    """Identify the file from its bytes, not from the client-supplied name or content type."""
    if head.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return ".webp"
    if head[4:12] in (b"ftypheic", b"ftypheix", b"ftypmif1", b"ftypheif"):
        return ".heic"
    if head.startswith(b"%PDF-"):
        return ".pdf"
    return None


async def save_upload_file(upload_file: UploadFile) -> str:
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    content = await upload_file.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Each file must be under {settings.MAX_UPLOAD_MB} MB.")
    extension = _sniff_extension(content[:16])
    if not extension:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, WebP, HEIC image or a PDF.")

    # Server-generated name only: the client's filename may contain path separators.
    filename = f"{uuid.uuid4().hex}{extension}"
    async with aiofiles.open(os.path.join(UPLOAD_DIR, filename), "wb") as out_file:
        await out_file.write(content)
    return f"/uploads/{filename}"
