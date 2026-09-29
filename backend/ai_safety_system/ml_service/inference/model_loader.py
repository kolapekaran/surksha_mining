from ultralytics import YOLO
import os

def load_model(model_name):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, "..", "models", model_name)
    return YOLO(model_path)