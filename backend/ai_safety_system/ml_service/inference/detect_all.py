from ai_safety_system.ml_service.inference.detect_fire import detect_fire
from ai_safety_system.ml_service.inference.detect_ppe import detect_ppe


def detect_all(frame):
    """Return model-backed alerts; None means a detector is not integrated.

    The current PPE model detects helmets, so the legacy ppe alert flag
    is true when a helmet was not detected (not a full PPE compliance audit).
    """
    helmet_detected = detect_ppe(frame)
    return {
        "fire": detect_fire(frame),
        "ppe": not helmet_detected,
        "fatigue": None,
    }
