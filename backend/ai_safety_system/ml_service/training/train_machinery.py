from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="datasets/construction-ppe/data.yaml",
    epochs=3,
    imgsz=416
)