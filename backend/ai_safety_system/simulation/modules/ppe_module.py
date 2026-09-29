from ai_safety_system.simulation.common import build_result, risk_level_for

def run(data):
    missing = not data.get("helmet") or not data.get("vest")
    risk_score = 70 if missing else 10

    return build_result(
        module="PPE",
        risk_score=risk_score,
        risk_level=risk_level_for(risk_score),
        message="PPE missing" if missing else "Safe"
    )