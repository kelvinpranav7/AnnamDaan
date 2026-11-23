import io
from typing import Optional

import httpx
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from PIL import Image

from .model import predict_safety

router = APIRouter()


class SafetyBody(BaseModel):
    image_url: Optional[str] = None


def _from_image(img: Image.Image) -> dict:
    arr = np.array(img.resize((224, 224))) / 255.0
    return predict_safety(arr)


@router.post("/safety")
async def safety_from_url(body: SafetyBody):
    if not body.image_url:
        raise HTTPException(400, "image_url required")
    async with httpx.AsyncClient(timeout=20.0) as c:
        r = await c.get(body.image_url)
        r.raise_for_status()
    img = Image.open(io.BytesIO(r.content)).convert("RGB")
    return _from_image(img)


@router.post("/safety/upload")
async def safety_from_upload(file: UploadFile = File(...)):
    raw = await file.read()
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    return _from_image(img)
