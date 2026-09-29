from ultralytics import YOLO
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "ppe_model.pt")
_model = None


def _get_model():
    global _model
    if _model is None:
        _model = YOLO(MODEL_PATH)
    return _model


def detect_ppe_details(frame):
    boxes = []
    helmet = False
    vest = False
    try:
        results = _get_model()(frame, imgsz=320, conf=0.40, verbose=False)
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                conf = float(box.conf[0])
                if conf < 0.40:
                    continue
                cls = int(box.cls[0])
                label = result.names.get(cls, str(cls)) if isinstance(result.names, dict) else str(cls)
                lower = label.lower()
                if "helmet" in lower or "hardhat" in lower:
                    helmet = True
                if "vest" in lower:
                    vest = True
                xyxy = [float(v) for v in box.xyxy[0].tolist()]
                boxes.append({
                    "label": label,
                    "confidence": round(conf, 4),
                    "x": xyxy[0], "y": xyxy[1],
                    "width": xyxy[2] - xyxy[0], "height": xyxy[3] - xyxy[1],
                    "risk": "MEDIUM",
                })
        return {"helmet": helmet, "vest": vest, "boxes": boxes, "source": "LIVE_ML"}
    except Exception as exc:
        return {"helmet": False, "vest": False, "boxes": [], "source": f"OFFLINE:{exc}"}


def detect_ppe(frame):
    return detect_ppe_details(frame)["helmet"]
