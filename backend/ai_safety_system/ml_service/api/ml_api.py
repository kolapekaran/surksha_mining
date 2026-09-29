from pathlib import Path

import cv2
import numpy as np
from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile

router = APIRouter()
app = FastAPI(title="SURAKSHA ML API")

MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_FILES = {
    "fire": "fire_smoke.pt",
    "ppe": "ppe_model.pt",
    "risk": "risk_model.pkl",
}


@router.post("/detect/all")
async def detect_all_endpoint(file: UploadFile = File(...)):
    """Run the available image detectors on an uploaded frame.

    Fatigue is reported as unavailable until its inference model is integrated;
    it is never presented as a negative detection by default.
    """
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image file.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    frame = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Image could not be decoded.")

    try:
        from ai_safety_system.ml_service.inference.detect_all import detect_all
        result = detect_all(frame)
    except Exception as exc:
        # Keep model/dependency failures explicit rather than returning fake results.
        raise HTTPException(
            status_code=503,
            detail=f"ML inference is unavailable: {type(exc).__name__}: {exc}",
        ) from exc

    return {
        "status": "PARTIAL",
        "fire": result.get("fire"),
        "ppe": result.get("ppe"),
        "fatigue": result.get("fatigue"),
        "available": {"fire": True, "ppe": True, "fatigue": False},
        "source": "ML_INFERENCE",
    }


@router.get("/status")
def get_status():
    return {
        "service": "SURAKSHA ML API",
        "models": {
            name: {"configured": (MODEL_DIR / filename).is_file(), "file": filename}
            for name, filename in MODEL_FILES.items()
        },
        "fatigue": {"configured": False, "reason": "Inference integration pending"},
    }


app.include_router(router)
