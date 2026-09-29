from ai_safety_system.ml_service.inference.final_system import run_detection_system

def run_detection():
    """Compatibility wrapper for the legacy /api/analyze endpoint."""
    return run_detection_system()
