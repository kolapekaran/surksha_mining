import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

ML_PATH = os.path.join(BASE_DIR, "..", "ml-service")

FIRE_MODEL = os.path.join(ML_PATH, "runs/detect/train-11/weights/best.pt")
PPE_MODEL = os.path.join(ML_PATH, "runs/detect/train-15/weights/best.pt")