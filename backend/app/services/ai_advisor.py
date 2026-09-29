def generate_suggestion(result):
    suggestions = []

    if result.get("fire"):
        suggestions.append("🚒 Fire detected: Activate suppression system")

    if not result.get("helmet"):
        suggestions.append("🪖 Worker without helmet: Immediate compliance required")

    if result.get("fatigue"):
        suggestions.append("😴 Worker fatigue: Recommend rest break")

    if not suggestions:
        suggestions.append("✅ All safety measures OK")

    return suggestions