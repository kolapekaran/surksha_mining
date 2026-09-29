from ultralytics import YOLO
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "fire_smoke.pt")
_model = None


def _get_model():
    global _model
    if _model is None:
        _model = YOLO(MODEL_PATH)
    return _model


def detect_fire_details(frame):
    boxes = []
    try:
        results = _get_model()(frame, imgsz=320, conf=0.40, verbose=False)
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                conf = float(box.conf[0])
                if conf < 0.40:
                    continue
                xyxy = [float(v) for v in box.xyxy[0].tolist()]
                label = result.names.get(int(box.cls[0]), "fire") if isinstance(result.names, dict) else "fire"
                boxes.append({
                    "label": label,
                    "confidence": round(conf, 4),
                    "x": xyxy[0], "y": xyxy[1],
                    "width": xyxy[2] - xyxy[0], "height": xyxy[3] - xyxy[1],
                    "risk": "HIGH",
                })
        return {"detected": bool(boxes), "boxes": boxes, "source": "LIVE_ML"}
    except Exception as exc:
        return {"detected": False, "boxes": [], "source": f"OFFLINE:{exc}"}


def detect_fire(frame):
    return detect_fire_details(frame)["detected"]
