import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "risk_model.pkl")
_model = None


def _get_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def get_risk_score(data: dict):
    helmet = 1 if data.get("helmet") else 0
    vest = 1 if data.get("vest") else 0
    fatigue = 1 if data.get("fatigue") else 0
    fire = 1 if data.get("fire") else 0

    try:
        risk_score = float(_get_model().predict([[helmet, vest, fatigue, fire]])[0])
        source = "ML"
    except Exception:
        risk_score = (
            (35 if fire else 0)
            + (20 if not helmet else 0)
            + (15 if not vest else 0)
            + (15 if fatigue else 0)
        )
        source = "ENGINEERING_FALLBACK"

    risk_score = max(0, min(100, round(risk_score)))
    label = "SAFE" if risk_score < 30 else "WARNING" if risk_score < 70 else "DANGER"
    return {"score": risk_score, "label": label, "source": source}
