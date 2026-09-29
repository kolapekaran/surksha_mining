from ai_safety_system.simulation.common import build_result, risk_level_for

def run(data):
    fire_detected = data.get("fire", False)
    risk_score = 90 if fire_detected else 10

    return build_result(
        module="Fire",
        risk_score=risk_score,
        risk_level=risk_level_for(risk_score),
        message="Fire detected!" if fire_detected else "Safe"
    )