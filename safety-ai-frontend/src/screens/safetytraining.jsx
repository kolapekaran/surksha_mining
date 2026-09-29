import { useState } from "react";

const GAME_URL = import.meta.env.VITE_SAFETY_GAME_URL || "http://localhost:5174";

export default function SafetyTraining() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <section style={{ padding: "18px clamp(12px, 2vw, 28px)", color: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>SURAKSHA · INTEGRATED TRAINING</div>
          <h1 style={{ fontSize: 26, margin: "6px 0" }}>Safety Training Game</h1>
          <p style={{ color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>Launch the interactive scenario trainer from the main safety dashboard.</p>
        </div>
        <button type="button" onClick={() => setReloadKey(value => value + 1)} style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 600 }}>Reload game</button>
      </div>
      <div style={{ border: "1px solid #334155", borderRadius: 12, overflow: "hidden", background: "#03111a" }}>
        <iframe
          key={reloadKey}
          title="SURAKSHA interactive safety training game"
          src={GAME_URL}
          style={{ display: "block", width: "100%", height: "min(82vh, 980px)", minHeight: 680, border: 0, background: "#03111a" }}
          allow="camera; microphone"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5, marginTop: 10 }}>The game runs as a separately served frontend inside this screen. Start the game development server on port 5174 and the FastAPI backend on port 8000. For deployment, set <code>VITE_SAFETY_GAME_URL</code> to the hosted game URL.</p>
    </section>
  );
}
