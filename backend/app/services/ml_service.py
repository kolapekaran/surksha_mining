from ai_safety_system.ml_service.inference.final_system import run_detection_system


def run_detection():
    try:
        result = run_detection_system()

        print("🔥 ML RESULT:", result)

        return result

    except Exception as e:
        print("❌ ML ERROR:", e)

        return {
            "helmet": False,
            "vest": False,
            "fatigue": False,
            "fire": False,
            "score": 0,
            "error": str(e)
        }