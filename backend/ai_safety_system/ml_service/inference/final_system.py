import os

# 🔥 Example (later replace with YOLO real models)
def run_detection_system():
    """
    FINAL ML ENTRY FUNCTION
    """

    # 🔴 TODO: replace with real detection
    helmet = False
    vest = False
    fatigue = False
    fire = True

    # 🔥 basic score logic
    score = 0

    if not helmet:
        score += 10
    if not vest:
        score += 10
    if fatigue:
        score += 10
    if fire:
        score += 10

    return {
        "helmet": helmet,
        "vest": vest,
        "fatigue": fatigue,
        "fire": fire,
        "score": score
    }