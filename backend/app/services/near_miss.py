def detect_near_miss(ml_result):
    if ml_result.get("fire") and not ml_result.get("helmet"):
        return True
    if ml_result.get("fatigue"):
        return True
    return False