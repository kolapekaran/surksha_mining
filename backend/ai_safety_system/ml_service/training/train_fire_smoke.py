from ultralytics import YOLO

# model load (pretrained)
model = YOLO("yolov8n.pt")

# train
model.train(
    data="datasets/fire_smoke/data.yaml",
    epochs=5,
    imgsz=412

)

# save
model.export(format="torchscript")