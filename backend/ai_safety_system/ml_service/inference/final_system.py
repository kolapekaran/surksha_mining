from __future__ import annotations

from typing import Any

from ai_safety_system.ml_service.inference.detect_all import detect_all
from ai_safety_system.ml_service.inference.predict_risk import get_risk_score


def run_detection_system(frame=None) -> dict[str, Any]:
    if frame is None:
        return {
            "helmet": False,
            "vest": False,
            "fatigue": False,
            "fire": False,
            "score": 0,
            "model_status": "NO_FRAME",
        }

    result = detect_all(frame)
    risk = get_risk_score({
        "helmet": result.get("helmet", False),
        "vest": result.get("vest", False),
        "fatigue": result.get("fatigue", False),
        "fire": result.get("fire", False),
    })

    return {**result, "risk": risk, "score": risk["score"]}
