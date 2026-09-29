import { useEffect, useState } from "react";
import { completeGameMission, getGameMissions, getGameProfile, getGameScenario, runSimulation } from "../services/api";

const fallbackMissions = [
  { id: "fire", name: "Factory Fire Safety", objective: "Choose the safest response to a simulated fire.", reward: 150 },
  { id: "ppe", name: "PPE Checkpoint", objective: "Select the PPE required for the work area.", reward: 120 },
  { id: "emergency", name: "Emergency Response", objective: "Choose safe first actions after an alarm.", reward: 200 },
  { id: "hazards", name: "Hazard Detection", objective: "Identify hazards in a simulated work area.", reward: 100 },
];

export default function SafetyGameScreen() {
  const [missions, setMissions] = useState(fallbackMissions);
  const [profile, setProfile] = useState({ xp: 0, level: 1, completed: [] });
  const [selected, setSelected] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [message, setMessage] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGameMissions(), getGameProfile()])
      .then(([m, p]) => {
        if (Array.isArray(m) && m.length) setMissions(m);
        if (p) setProfile(p);
      })
      .catch(() => setMessage("Training backend is offline. Showing local training structure."))
      .finally(() => setLoading(false));
  }, []);

  async function openMission(id) {
    setMessage("");
    setSelectedChoices([]);
    setSelected(id);
    try {
      setScenario(await getGameScenario(id));
    } catch {
      setMessage("Unable to load this mission from the backend.");
    }
  }

  function toggleChoice(index) {
    setSelectedChoices((current) => current.includes(index)
      ? current.filter((x) => x !== index)
      : [...current, index]);
  }

  async function submit() {
    if (!scenario || !selected) return;
    const correct = scenario.correct || [];
    const safe = correct.length === selectedChoices.length && correct.every((x) => selectedChoices.includes(x));
    const score = safe ? 100 : 0;
    const result = await completeGameMission(selected, safe, score);
    setProfile(result.profile);
    setMessage(safe
      ? "Training response recorded as safe. Continue following your site's approved procedure."
      : "Training response was not complete. Review the scenario and follow the approved procedure.");
  }

  async function simulate() {
    try {
      setSimulation(await runSimulation({ intensity: 60, people: 8, exits: 2 }));
    } catch {
      setMessage("Simulation service is unavailable.");
    }
  }

  if (loading) return <div style={styles.page}><h1>Safety Game</h1><p>Connecting to training backend…</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>SURAKSHA · TRAINING SYSTEM</span>
          <h1 style={styles.title}>Safety Game</h1>
          <p style={styles.sub}>Interactive safety scenarios connected to the SURAKSHA backend.</p>
        </div>
        <div style={styles.profile}>
          <b>LEVEL {profile.level}</b>
          <span>{profile.xp} XP</span>
          <span>{profile.completed?.length || 0} completed</span>
        </div>
      </div>

      {message && <div style={styles.notice}>{message}</div>}

      {!scenario ? (
        <>
          <div style={styles.grid}>
            {missions.map((mission) => (
              <button key={mission.id} style={styles.card} onClick={() => openMission(mission.id)}>
                <span style={styles.icon}>⚠</span>
                <b>{mission.name}</b>
                <p>{mission.objective}</p>
                <small>+{mission.reward} XP · START MISSION →</small>
              </button>
            ))}
          </div>
          <div style={styles.panel}>
            <div>
              <h2>What-if Safety Simulation</h2>
              <p>Run a backend simulation using scenario conditions.</p>
            </div>
            <button style={styles.primary} onClick={simulate}>RUN SIMULATION</button>
            {simulation && <strong>Risk: {simulation.risk} · {simulation.label} · {simulation.source}</strong>}
          </div>
        </>
      ) : (
        <div style={styles.panel}>
          <button style={styles.back} onClick={() => setScenario(null)}>← Missions</button>
          <span style={styles.eyebrow}>MISSION · {scenario.mission?.name?.toUpperCase()}</span>
          <h2>{scenario.mission?.name}</h2>
          <p>{scenario.mission?.objective}</p>
          <div style={styles.choices}>
            {(scenario.actions || []).map((action, i) => (
              <button key={action} onClick={() => toggleChoice(i)}
                style={{ ...styles.choice, ...(selectedChoices.includes(i) ? styles.choiceSelected : {}) }}>
                <span>0{i + 1}</span>{action}
              </button>
            ))}
          </div>
          <button style={styles.primary} onClick={submit}>SUBMIT SAFE RESPONSE</button>
        </div>
      )}

      <p style={styles.disclaimer}>Training simulation only. Real incidents must follow site-approved procedures, emergency plans and supervisor instructions.</p>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", padding: "32px", background: "#0b1117", color: "#e5edf4", boxSizing: "border-box" },
  header: { maxWidth: 1200, margin: "0 auto 28px", display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" },
  eyebrow: { fontSize: 11, letterSpacing: 2, color: "#66d9ff" },
  title: { fontSize: 42, margin: "8px 0" },
  sub: { color: "#94a3b8" },
  profile: { display: "flex", gap: 18, alignItems: "center", padding: 18, background: "#111c25", border: "1px solid #243342", borderRadius: 12 },
  grid: { maxWidth: 1200, margin: "0 auto 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 },
  card: { textAlign: "left", padding: 22, minHeight: 190, color: "#e5edf4", background: "#111c25", border: "1px solid #243342", borderRadius: 14, cursor: "pointer" },
  icon: { display: "block", fontSize: 28, marginBottom: 16 },
  panel: { maxWidth: 1200, margin: "0 auto", padding: 26, background: "#111c25", border: "1px solid #243342", borderRadius: 14, display: "grid", gap: 18 },
  choices: { display: "grid", gap: 10 },
  choice: { padding: 16, textAlign: "left", color: "#e5edf4", background: "#0b1117", border: "1px solid #334155", borderRadius: 9, cursor: "pointer" },
  choiceSelected: { borderColor: "#66d9ff", background: "#102a36" },
  primary: { padding: "13px 18px", border: 0, borderRadius: 8, background: "#1687b7", color: "white", fontWeight: 700, cursor: "pointer" },
  back: { width: "fit-content", padding: "8px 12px", background: "transparent", border: "1px solid #334155", color: "#cbd5e1", borderRadius: 7, cursor: "pointer" },
  notice: { maxWidth: 1200, margin: "0 auto 18px", padding: 14, background: "#17232d", border: "1px solid #31536b", borderRadius: 8 },
  disclaimer: { maxWidth: 1200, margin: "24px auto 0", color: "#64748b", fontSize: 12 },
};
