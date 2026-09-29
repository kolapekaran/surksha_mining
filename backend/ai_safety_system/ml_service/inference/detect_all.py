from ai_safety_system.ml_service.inference.detect_fire import detect_fire
from ai_safety_system.ml_service.inference.detect_ppe import detect_ppe


def detect_all(frame):
    """Return model-backed detections; None means a detector is not integrated."""
    return {
        "fire": detect_fire(frame),
        "ppe": detect_ppe(frame),
        "fatigue": None,
    }
