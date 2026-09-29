from ultralytics import YOLO
import os
import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "..", "models", "ppe_model.pt")

model = YOLO(model_path)

def detect_ppe(frame):
    img = cv2.resize(frame, (416, 320))

    results = model(img, imgsz=320)

    helmet_detected = False

    for r in results:
        if r.boxes is None:
            continue

        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            label = r.names[cls]

            print("Detected:", label, "Conf:", conf)  # debug

            # 🔥 ONLY helmet count karo
            if label.lower() == "helmet" and conf > 0.6:
                helmet_detected = True

    return helmet_detected