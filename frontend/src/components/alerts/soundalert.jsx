import { useCallback, useEffect, useRef } from "react";

function SoundAlert({ enabled = true, risk = "LOW" }) {
  const audioContextRef = useRef(null);

  const playAlertSound = useCallback(async () => {
    if (!enabled || !["HIGH", "CRITICAL"].includes(String(risk).toUpperCase())) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === "suspended") await audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(
        String(risk).toUpperCase() === "CRITICAL" ? 1000 : 700,
        audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.35);
    } catch (error) {
      console.error("Alert sound error:", error);
    }
  }, [enabled, risk]);

  useEffect(() => {
    playAlertSound();
  }, [playAlertSound]);

  useEffect(() => () => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
  }, []);

  return (
    <button
      className="sx-sound-alert"
      onClick={playAlertSound}
      disabled={!enabled || !["HIGH", "CRITICAL"].includes(String(risk).toUpperCase())}
    >
      🔊 TEST ALERT SOUND
    </button>
  );
}

export default SoundAlert;
