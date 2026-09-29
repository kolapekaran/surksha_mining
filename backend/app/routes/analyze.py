from fastapi import APIRouter
from app.services.ml_service import run_detection
from app.services.risk_engine import calculate_risk
from app.services.fusion_engine import fuse_results
from app.services.near_miss import detect_near_miss
from app.services.simulation_service import simulate_scenario
from app.services.certificate_service import generate_certificate
from app.services.ai_advisor import generate_suggestion
from app.utils.logger import log_incident

router = APIRouter()

@router.get("/analyze")
def analyze():

    result = run_detection()

    risk = calculate_risk(result)

    alerts = fuse_results(result)

    near_miss = detect_near_miss(result)

    simulation = simulate_scenario(result)

    suggestions = generate_suggestion(result)

    certificate = generate_certificate(result)

    # 🔥 LOG SAVE
    log_incident(result)

    return {
        "data": result,
        "risk": risk,
        "alerts": alerts,
        "near_miss": near_miss,
        "simulation": simulation,
        "suggestions": suggestions,
        "certificate": certificate
    }