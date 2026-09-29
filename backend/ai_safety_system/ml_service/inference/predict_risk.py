import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, "models", "risk_model.pkl")

model = joblib.load(model_path)

def get_risk_score(data: dict):

    helmet = 1 if data.get("helmet") else 0
    vest = 1 if data.get("vest") else 0
    fatigue = 1 if data.get("fatigue") else 0
    fire = 1 if data.get("fire") else 0

    X = [[helmet, vest, fatigue, fire]]

    risk_score = model.predict(X)[0]

    if risk_score < 30:
        label = "SAFE"
    elif risk_score < 70:
        label = "WARNING"
    else:
        label = "DANGER"

    return {
        "score": int(risk_score),
        "label": label
    }