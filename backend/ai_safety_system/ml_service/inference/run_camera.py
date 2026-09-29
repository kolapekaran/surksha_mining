import cv2
from ai_safety_system.ml_service.inference.detect_all import detect_all

def run_camera():
    cap = cv2.VideoCapture(0)

    frame_count = 0

    # default result (important)
    result = {
        "fire": False,
        "ppe": False,
        "fatigue": False
    }

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # 🔥 process every 5th frame (performance)
        if frame_count % 5 == 0:
            result = detect_all(frame)
            print("DEBUG:", result)   # 👈 debug

        # =============================
        # 🧠 FINAL RISK LOGIC
        # =============================

        if result["fire"] and not result["ppe"]:
            text = "🔥 HIGH++ RISK"
            color = (0, 0, 255)

        elif result["fire"]:
            text = "🔥 HIGH RISK - FIRE"
            color = (0, 0, 255)

        elif not result["ppe"]:
            text = "⚠️ NO HELMET"
            color = (0, 165, 255)

        elif result["fatigue"]:
            text = "⚠️ FATIGUE"
            color = (0, 165, 255)

        else:
            text = "✅ SAFE"
            color = (0, 255, 0)

        # =============================
        # 🎯 DRAW OVERLAY
        # =============================

        # background box
        cv2.rectangle(frame, (20, 20), (420, 90), (0, 0, 0), -1)

        # text
        cv2.putText(frame, text, (30, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8, color, 2)

        # =============================
        # 📺 SHOW FRAME
        # =============================
        cv2.imshow("AI Safety Monitor", frame)

        # ESC key to exit
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_camera()