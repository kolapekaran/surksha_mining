import cv2
from ultralytics import YOLO
import winsound

fire_model = YOLO("runs/detect/train-11/weights/best.pt")
ppe_model = YOLO("runs/detect/train-15/weights/best.pt")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()

    fire_results = fire_model(frame, conf=0.4)
    ppe_results = ppe_model(frame, conf=0.4)

    detected = []
    fire = False

    # PPE detect
    for r in ppe_results:
        for b in r.boxes:
            detected.append(ppe_model.names[int(b.cls[0])])

    # Fire detect
    for r in fire_results:
        for b in r.boxes:
            if fire_model.names[int(b.cls[0])] == "fire":
                fire = True

    # ⚡ ELECTRICAL RISK
    if fire or ("Person" in detected and "gloves" not in detected):
        cv2.putText(frame, "⚡ ELECTRICAL HAZARD",
                    (50,100), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0,0,255), 3)
        winsound.Beep(1200, 400)

    cv2.imshow("Electrical Safety", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()