from fastapi import FastAPI, File, HTTPException, UploadFile
import cv2
import numpy as np

app = FastAPI(title="SURAKSHA ML Inference API", version="1.0.0")

@app.post("/all")
async def detect_all(file: UploadFile = File(...)):
    """Run the available fire/smoke and PPE models against one uploaded frame."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    encoded = np.frombuffer(contents, dtype=np.uint8)
    frame = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Uploaded file is not a supported image.")

    try:
        # Import lazily so the API can start even if optional ML packages/weights
        # are unavailable; the inference request will return a clear error.
        from ai_safety_system.ml_service.inference.detect_all import detect_all as run_models
        detections = run_models(frame)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"ML inference unavailable: {type(exc).__name__}: {exc}",
        ) from exc

    return {
        "fire": bool(detections.get("fire", False)),
        "ppe": bool(detections.get("ppe", False)),
        "fatigue": bool(detections.get("fatigue", False)),
        "source": "MODEL_INFERENCE",
        "note": "Fatigue detection is currently a placeholder, not an ML prediction.",
    }

@app.get("/status")
def get_status():
    return {
        "service": "ml-inference",
        "status": "ready",
        "available_models": ["fire_smoke.pt", "ppe_model.pt", "risk_model.pkl"],
        "fatigue": "placeholder",
    }
