from ai_safety_system.simulation.common import build_result, risk_level_for

def run(results):
    total = sum(r["score"] for r in results) / len(results)

    if total > 70:
        return "HIGH"
    elif total > 40:
        return "MEDIUM"
    return "LOW"