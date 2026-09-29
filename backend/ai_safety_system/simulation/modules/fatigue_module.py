from ai_safety_system.simulation.common import build_result, risk_level_for

def run(data):
    tired = data.get("fatigue", False)
    risk_score = 60 if tired else 10

    return build_result(
        module="Fatigue",
        risk_score=risk_score,
        risk_level=risk_level_for(risk_score),
        message="Worker tired" if tired else "Active"
    )