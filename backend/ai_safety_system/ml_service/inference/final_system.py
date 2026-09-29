"""ML compatibility entry point. Image inference is served by the unified /detect/all endpoint."""
from typing import Any

def run_detection_system(frame: Any = None):
    if frame is None:
        return {"helmet":False,"vest":False,"fatigue":False,"fire":False,"score":0,"error":"No image frame supplied; use POST /detect/all for ML inference."}
    from .detect_all import detect_all
    result=detect_all(frame)
    return {"helmet":bool(result.get("ppe")),"vest":False,"fatigue":bool(result.get("fatigue")),"fire":bool(result.get("fire")),"score":0}
