import cv2
from ultralytics import YOLO

model = YOLO("runs/detect/train-11/weights/best.pt")

cap = cv2.VideoCapture(0)

fire_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, conf=0.80, verbose=False)

    real_fire = False

    if results[0].boxes is not None:
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            conf = float(box.conf[0])

            x1, y1, x2, y2 = box.xyxy[0]
            area = (x2 - x1) * (y2 - y1)

            # 🔥 VERY STRICT CONDITION
            if label == "fire" and conf > 0.80 and area > 12000:
                real_fire = True

    # 🔁 temporal check
    if real_fire:
        fire_count += 1
    else:
        fire_count = 0

    # 🚨 FINAL DECISION
    if fire_count >= 8:
        status = "REAL FIRE 🔥"
    else:
        status = "SAFE"

    frame = results[0].plot()

    cv2.putText(frame, status, (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Fire Detection", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()