from inference.predict_risk import get_risk_score

data = {
    "helmet": False,
    "vest": True,
    "fatigue": False,
    "fire": False
}

result = get_risk_score(data)

print(result)