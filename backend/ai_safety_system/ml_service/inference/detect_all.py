from ai_safety_system.ml_service.inference.detect_fire import detect_fire
from ai_safety_system.ml_service.inference.detect_ppe import detect_ppe

def detect_all(frame):
    fire = detect_fire(frame)
    ppe = detect_ppe(frame)

    fatigue = False  # future ML

    return {
        "fire": fire,
        "ppe": ppe,
        "fatigue": fatigue
    }