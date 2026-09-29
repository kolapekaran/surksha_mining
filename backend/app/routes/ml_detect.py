"""Image inference API bridging the React camera client to existing ML detectors.

The endpoint returns 503 when model loading/inference is unavailable; it never
reports a fabricated safe result. Fatigue remains an explicitly labelled demo
placeholder until a validated fatigue model is integrated.
"""
from fastapi import APIRouter, File, HTTPException, UploadFile
import cv2
import numpy as np

router = APIRouter(tags=["ML inference"])
MAX_IMAGE_BYTES = 10 * 1024 * 1024


@router.post("/detect/all")
async def detect_all(file: UploadFile = File(...)):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image file.")

    contents = await file.read(MAX_IMAGE_BYTES + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB.")

    frame = cv2.imdecode(np.frombuffer(contents, dtype=np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Unable to decode uploaded image.")

    try:
        from ai_safety_system.ml_service.inference.detect_all import detect_all as infer
        detections = infer(frame)
    except Exception as exc:
        # Avoid leaking local paths or stack traces to the client.
        raise HTTPException(
            status_code=503,
            detail="ML inference unavailable. Check model files and backend dependencies.",
        ) from exc

    return {
        **detections,
        "source": "ML_INFERENCE",
        "fatigue_status": "DEMO_PLACEHOLDER",
    }
