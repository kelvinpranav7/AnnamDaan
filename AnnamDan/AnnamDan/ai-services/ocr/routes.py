import io
import re
from typing import Optional

import httpx
import pytesseract
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from PIL import Image

router = APIRouter()

FSSAI_REGEX = re.compile(r"\b(\d{14})\b")


class FssaiBody(BaseModel):
    image_url: Optional[str] = None


def _extract(img: Image.Image) -> dict:
    raw = pytesseract.image_to_string(img)
    match = FSSAI_REGEX.search(raw.replace(" ", ""))
    license_num = match.group(1) if match else ""
    valid = bool(license_num) and license_num[0] in {"1", "2"}
    confidence = 0.95 if valid else (0.6 if license_num else 0.0)
    return {
        "license": f"FSSAI-{license_num}" if license_num else "",
        "valid": valid,
        "confidence": confidence,
        "raw_excerpt": raw[:200],
    }


@router.post("/fssai")
async def fssai_from_url(body: FssaiBody):
    if not body.image_url:
        raise HTTPException(400, "image_url is required")
    async with httpx.AsyncClient(timeout=20.0) as c:
        r = await c.get(body.image_url)
        r.raise_for_status()
    try:
        img = Image.open(io.BytesIO(r.content)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Invalid image")
    return _extract(img)


@router.post("/fssai/upload")
async def fssai_from_upload(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    return _extract(img)
