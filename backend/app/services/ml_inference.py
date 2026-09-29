from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

import cv2
import numpy as np

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(BASE_DIR, "ai_safety_system", "ml_service", "models")


def _model_path(name: str) -> str:
    return os.path.join(MODEL_DIR, name)


@lru_cache(maxsize=1)
def _fire_model():
    from ultralytics import YOLO
    return YOLO(_model_path("fire_smoke.pt"))


@lru_cache(maxsize=1)
def _ppe_model():
    from ultralytics import YOLO
    return YOLO(_model_path("ppe_model.pt"))


@lru_cache(maxsize=1)
def _risk_model():
    import joblib
    return joblib.load(_model_path("risk_model.pkl"))


def _read_frame(contents: bytes):
    image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Uploaded file is not a valid image.")
    return image


def _boxes(result, names) -> list[dict[str, Any]]:
    output = []
    if result.boxes is None:
        return output
    for box in result.boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = [float(v) for v in box.xyxy[0].tolist()]
        label = names.get(cls, str(cls)) if isinstance(names, dict) else str(cls)
        output.append({
            "label": label,
            "confidence": round(conf, 4),
            "x": round(xyxy[0], 2),
            "y": round(xyxy[1], 2),
            "width": round(xyxy[2] - xyxy[0], 2),
            "height": round(xyxy[3] - xyxy[1], 2),
        })
    return output


def analyze_image(contents: bytes) -> dict[str, Any]:
    frame = _read_frame(contents)
    boxes: list[dict[str, Any]] = []
    errors: list[str] = []

    fire = False
    helmet = False
    vest = False

    try:
        results = _fire_model()(frame, imgsz=320, conf=0.40, verbose=False)
        for result in results:
            result_boxes = _boxes(result, result.names)
            for item in result_boxes:
                item["source"] = "fire_smoke"
                item["risk"] = "HIGH"
            boxes.extend(result_boxes)
            fire = fire or bool(result_boxes)
    except Exception as exc:
        errors.append(f"fire_model: {exc}")

    try:
        results = _ppe_model()(frame, imgsz=320, conf=0.40, verbose=False)
        for result in results:
            result_boxes = _boxes(result, result.names)
            for item in result_boxes:
                item["source"] = "ppe"
                item["risk"] = "MEDIUM"
                label = item["label"].lower()
                if "helmet" in label or "hardhat" in label:
                    helmet = True
                if "vest" in label:
                    vest = True
            boxes.extend(result_boxes)
    except Exception as exc:
        errors.append(f"ppe_model: {exc}")

    features = {"helmet": helmet, "vest": vest, "fatigue": False, "fire": fire}
    risk = _risk_score(features, errors)

    return {
        **features,
        "ppe": helmet,
        "risk": risk,
        "boxes": boxes,
        "model_status": "LIVE" if not errors else "DEGRADED",
        "errors": errors,
    }


def _risk_score(features: dict[str, bool], errors: list[str]) -> dict[str, Any]:
    try:
        model = _risk_model()
        X = [[int(features["helmet"]), int(features["vest"]), 0, int(features["fire"])]]
        value = float(model.predict(X)[0])
        score = max(0, min(100, round(value)))
        source = "ML"
    except Exception as exc:
        errors.append(f"risk_model: {exc}")
        score = 0
        score += 35 if features["fire"] else 0
        score += 20 if not features["helmet"] else 0
        score += 15 if not features["vest"] else 0
        source = "ENGINEERING_FALLBACK"

    label = "SAFE" if score < 30 else "WARNING" if score < 70 else "DANGER"
    return {"score": score, "label": label, "source": source}


def model_status() -> dict[str, Any]:
    return {
        "fire_model": os.path.exists(_model_path("fire_smoke.pt")),
        "ppe_model": os.path.exists(_model_path("ppe_model.pt")),
        "risk_model": os.path.exists(_model_path("risk_model.pkl")),
        "model_directory": MODEL_DIR,
    }
