def calculate_risk(data):
    score = data.get("score", 0)

    if data.get("fire"):
        score += 40
    if not data.get("helmet"):
        score += 20
    if data.get("fatigue"):
        score += 15

    if score > 80:
        label = "CRITICAL 🔴"
    elif score > 50:
        label = "HIGH 🟠"
    else:
        label = "SAFE 🟢"

    return {"score": score, "label": label}