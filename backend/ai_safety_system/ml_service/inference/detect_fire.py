from ultralytics import YOLO
import os
import cv2
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "..", "models", "fire_smoke.pt")

model = YOLO(model_path)

def detect_fire(frame):
    img = cv2.resize(frame, (416, 320))

    results = model(img, imgsz=320)

    for r in results:
        if r.boxes is None or len(r.boxes) == 0:
            return False

        for box in r.boxes:
            conf = float(box.conf[0])
            if conf > 0.6:
                return True

    return False