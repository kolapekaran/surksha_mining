from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="construction-ppe.yaml",
    epochs=3,
    imgsz=416
)