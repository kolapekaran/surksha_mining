from ultralytics import YOLO
import cv2

model = YOLO("runs/detect/train-15/weights/best.pt")

# image load
img = cv2.imread("test.jpg")

results = model(img, conf=0.4)

output = results[0].plot()

cv2.imshow("PPE Detection Demo", output)
cv2.waitKey(0)
cv2.destroyAllWindows()