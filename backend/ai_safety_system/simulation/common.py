def build_result(name, score, message):
    return {
        "module": name,
        "score": score,
        "risk": risk_level_for(score),
        "message": message
    }

def risk_level_for(score):
    if score > 80:
        return "HIGH"
    elif score > 50:
        return "MEDIUM"
    return "LOW"