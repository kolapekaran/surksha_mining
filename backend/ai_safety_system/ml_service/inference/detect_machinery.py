from ultralytics import YOLO
import cv2

# 🔥 apna trained model path
model = YOLO("runs/detect/train-15/weights/best.pt")

# 🔥 image path
image_path = "test.jpg"

# prediction
results = model(image_path, conf=0.3)

# show result
for r in results:
    img = r.plot()   # boxes draw karega

    cv2.imshow("Result", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()