from ai_safety_system.simulation.common import build_result, risk_level_for

def run(data):
    risk_score = 30

    return build_result(
        module="Machinery",
        risk_score=risk_score,
        risk_level=risk_level_for(risk_score),
        message="Normal"
    )