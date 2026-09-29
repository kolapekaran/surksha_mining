def fuse_results(ml_result):
    alerts = []

    if ml_result.get("fire"):
        alerts.append("🔥 Fire detected")

    if not ml_result.get("helmet"):
        alerts.append("⚠ No helmet")

    if not ml_result.get("vest"):
        alerts.append("⚠ No safety vest")

    if ml_result.get("fatigue"):
        alerts.append("😴 Worker fatigue")

    return {
        "alerts": alerts,
        "count": len(alerts)
    }