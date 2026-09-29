import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "";
const panel = { background: "#172033", border: "1px solid #334155", borderRadius: 12, padding: 20 };
const button = { background: "#2563eb", color: "white", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 600 };
const secondary = { ...button, background: "#334155" };

export default function SafetyTraining() {
  const [missions, setMissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(`${API}/game/missions`)
      .then(async r => { if (!r.ok) throw new Error(`API returned ${r.status}`); return r.json(); })
      .then(data => { if (alive) { setMissions(data.missions || []); setState("ready"); } })
      .catch(e => { if (alive) { setError(e.message); setState("offline"); } });
    return () => { alive = false; };
  }, []);

  async function openMission(m) {
    setSelected(null); setChoice(""); setFeedback(""); setScore(0); setError("");
    try {
      const r = await fetch(`${API}/game/scenarios/${encodeURIComponent(m.id)}`);
      if (!r.ok) throw new Error(`Could not load scenario (${r.status})`);
      setSelected(await r.json());
    } catch (e) { setError(e.message); }
  }

  function choose(id) {
    setChoice(id);
    const safe = id === "evacuate" || id === "isolate" || id === "report";
    if (safe) {
      setScore(100);
      setFeedback("Safer training choice. Raise the alarm, keep clear of the hazard, and follow the approved site emergency procedure and designated response team's instructions.");
    } else {
      setScore(20);
      setFeedback("This choice may increase exposure to danger. Do not approach or remain in a hazardous area to investigate. Raise the alarm and follow the approved site emergency procedure.");
    }
  }

  async function complete() {
    if (!selected || !choice) return;
    try {
      const r = await fetch(`${API}/game/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mission_id: selected.id, score, decisions: [choice] }) });
      const data = await r.json();
      if (!r.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Completion request failed");
      setFeedback(prev => `${prev} Scenario checked by backend. ${data.persistence || "Progress is not durably stored."}.`);
    } catch (e) { setFeedback(prev => `${prev} Backend completion unavailable: ${e.message}`); }
  }

  return <section style={{ padding: 24, maxWidth: 1100, margin: "0 auto", color: "#f8fafc" }}>
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>SURAKSHA · TRAINING MODULE</div>
      <h1 style={{ fontSize: 30, margin: "8px 0" }}>Safety Training Game</h1>
      <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>Practice hazard recognition and decision-making in educational scenarios. This module is for training only, not live site guidance or a certified assessment.</p>
    </div>
    {state === "loading" && <div style={panel}>Loading scenarios from the backend…</div>}
    {state === "offline" && <div style={{ ...panel, borderColor: "#b45309" }}><b>Training API unavailable</b><p>{error}</p><p>Start the FastAPI backend to load scenarios. No local mock records are shown as backend data.</p><button style={secondary} onClick={() => location.reload()}>Retry</button></div>}
    {error && state !== "offline" && <p role="alert" style={{ color: "#fbbf24" }}>{error}</p>}
    {!selected ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
      {missions.map(m => <article key={m.id} style={panel}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 700 }}>{m.module.toUpperCase()} · {m.mode}</div>
        <h2 style={{ fontSize: 18 }}>{m.title}</h2><p style={{ color: "#cbd5e1", minHeight: 50 }}>{m.objective}</p>
        <button style={button} onClick={() => openMission(m)}>Start scenario →</button>
      </article>)}
    </div> : <div style={{ ...panel, maxWidth: 780 }}>
      <button style={secondary} onClick={() => setSelected(null)}>← All scenarios</button>
      <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 700, marginTop: 20 }}>{selected.module.toUpperCase()} · EDUCATIONAL EXERCISE</div>
      <h2>{selected.title}</h2><p style={{ color: "#cbd5e1" }}>{selected.briefing} {selected.objective}</p>
      <div style={{ background: "#0f172a", borderRadius: 8, padding: 16, margin: "18px 0" }}><b>Situation</b><p style={{ color: "#cbd5e1" }}>A potential hazard has been identified. Choose the next response that prioritizes people’s safety.</p>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {[["evacuate","Raise the alarm, move away using the designated safe route, and report to the assembly point."],["report","Notify the supervisor / designated response team and follow the approved site plan."],["investigate","Approach the hazard to inspect it yourself."],["remain","Remain in the affected area and continue work."]].map(([id,label]) => <button key={id} onClick={() => choose(id)} aria-pressed={choice===id} style={{ ...secondary, textAlign: "left", border: choice===id ? "2px solid #38bdf8" : "1px solid #475569", background: choice===id ? "#1e3a5f" : "#334155" }}>{label}</button>)}
        </div>
      </div>
      {feedback && <div role="status" style={{ borderLeft: "4px solid #38bdf8", padding: 14, background: "#0f172a", lineHeight: 1.6, marginBottom: 16 }}>{feedback}<p style={{ color: "#94a3b8", marginBottom: 0 }}>Training score: {score}/100 · Illustrative only</p></div>}
      <button disabled={!choice} style={{ ...button, opacity: choice ? 1 : .5 }} onClick={complete}>Submit completion to backend</button>
    </div>}
  </section>;
}
