
import { useRef } from "react";

function SoundAlert({ enabled = true, risk = "LOW" }) {
  const audioContextRef = useRef(null);

  const playAlertSound = () => {
    if (!enabled || risk === "LOW") {
      return;
    }

    try {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        console.warn("Web Audio API is not supported.");
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "square";

      oscillator.frequency.setValueAtTime(
        risk === "CRITICAL" ? 1000 : 700,
        audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(
        0.15,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.4
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error("Alert sound error:", error);
    }
  };

  return (
    <button
      onClick={playAlertSound}
      disabled={!enabled || risk === "LOW"}
      style={{
        padding: "10px 16px",
        border: "none",
        borderRadius: "6px",
        cursor:
          !enabled || risk === "LOW"
            ? "not-allowed"
            : "pointer",
        backgroundColor:
          risk === "CRITICAL"
            ? "#dc2626"
            : risk === "HIGH"
            ? "#ef4444"
            : "#374151",
        color: "#ffffff",
        opacity:
          !enabled || risk === "LOW"
            ? 0.5
            : 1,
      }}
    >
      🔊 Test Alert Sound
    </button>
  );
}

export default SoundAlert;