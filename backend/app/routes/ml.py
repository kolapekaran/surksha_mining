from fastapi import APIRouter, File, UploadFile

from app.services.ml_inference import analyze_image, model_status

router = APIRouter(tags=["ml"])


@router.get("/health")
def ml_health():
    status = model_status()
    return {
        "status": "ok" if all(status[k] for k in ("fire_model", "ppe_model", "risk_model")) else "degraded",
        "models": status,
    }


@router.post("/detect/all")
async def detect_all(file: UploadFile = File(...)):
    contents = await file.read()
    return analyze_image(contents)
