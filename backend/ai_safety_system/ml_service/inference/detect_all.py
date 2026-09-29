from ai_safety_system.ml_service.inference.detect_fire import detect_fire_details
from ai_safety_system.ml_service.inference.detect_ppe import detect_ppe_details


def detect_all(frame):
    fire = detect_fire_details(frame)
    ppe = detect_ppe_details(frame)
    return {
        "fire": fire["detected"],
        "ppe": ppe["helmet"],
        "helmet": ppe["helmet"],
        "vest": ppe["vest"],
        "fatigue": False,
        "boxes": fire["boxes"] + ppe["boxes"],
        "sources": {"fire": fire["source"], "ppe": ppe["source"]},
    }
