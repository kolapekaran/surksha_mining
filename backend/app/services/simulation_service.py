def simulate_scenario(current_data, increase_load=20):
    new_score = current_data["score"] + increase_load

    return {
        "original_score": current_data["score"],
        "simulated_score": new_score,
        "risk_level": "HIGH" if new_score > 70 else "MEDIUM"
    }