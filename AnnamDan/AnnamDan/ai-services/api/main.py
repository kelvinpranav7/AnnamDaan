from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ocr.routes import router as ocr_router
from cnn.routes import router as cnn_router

app = FastAPI(
    title="Annam Daan · AI Services",
    version="1.0.0",
    description="OCR (FSSAI) + CNN (food safety) microservice",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "annam-daan-ai"}


app.include_router(ocr_router, prefix="/ocr", tags=["ocr"])
app.include_router(cnn_router, prefix="/cnn", tags=["cnn"])
