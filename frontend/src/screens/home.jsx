import { useState } from "react";
import { useAppContext } from "../context/appcontext";

const statusClass = (value) => {
  const s = String(value || "").toLowerCase();
  if (["active","monitoring","ready","online"].some(x => s.includes(x))) return "good";
  if (["error","failed","critical","offline"].some(x => s.includes(x))) return "danger";
  return "warn";
};

function Metric({ label, value, sub, tone = "" }) {
  return <div className="sx-metric"><div className="sx-metric-label">{label}</div><div className={`sx-metric-value ${tone}`}>{value}</div><div className="sx-metric-sub">{sub}</div></div>;
}

export default function Home() {
  const [showInfo, setShowInfo] = useState(false);
  const { detections = [], alerts = [], cameraStatus = "INACTIVE", systemStatus = "READY", backendOnline = false } = useAppContext();
  const highRisk = detections.filter(d => ["HIGH","CRITICAL"].includes(String(d.risk).toUpperCase())).length;

  return <section className="sx-page sx-command-page">
    <div className="sx-page-heading"><div><div className="sx-eyebrow">COMMAND CENTER / LIVE OVERVIEW</div><h1>Safety Operations <span>Control</span></h1><p>Real-time situational awareness for industrial and mining safety operations.</p></div><div className="sx-clock-card"><div className="sx-clock-label">SYSTEM STATE</div><div className={`sx-state ${statusClass(systemStatus)}`}><span />{String(systemStatus).toUpperCase()}</div><small>ZONE 01 • PRIMARY NODE</small></div></div>

    <div className="sx-command-grid">
      <div className="sx-hero-panel"><div className="sx-panel-grid" /><div className="sx-hero-content"><div className="sx-hero-kicker"><span /> OPERATIONAL READINESS</div><h2>Protect every<br /><em>decision.</em></h2><p>Monitor hazards, validate AI detections and move from observation to response without leaving the command layer.</p><div className="sx-hero-actions"><div className="sx-command-chip"><b>01</b> LIVE MONITORING</div><div className="sx-command-chip"><b>02</b> AI ANALYSIS</div><div className="sx-command-chip"><b>03</b> RESPONSE</div></div></div><div className="sx-radar"><div /><span /><b>01</b></div></div>

      <div className="sx-metrics-panel">
        <Metric label="Detection Events" value={detections.length.toString().padStart(2,"0")} sub="CURRENT SESSION" />
        <Metric label="Active Alerts" value={alerts.length.toString().padStart(2,"0")} sub="REQUIRES REVIEW" tone={alerts.length ? "danger" : "good"} />
        <Metric label="High Risk" value={highRisk.toString().padStart(2,"0")} sub="HIGH / CRITICAL" tone={highRisk ? "danger" : "good"} />
        <Metric label="AI Backend" value={backendOnline ? "LIVE" : "OFF"} sub="INFERENCE LINK" tone={backendOnline ? "good" : "warn"} />
      </div>
    </div>

    <div className="sx-section-head"><div><span className="sx-section-code">SYS / 01</span><h2>Operational telemetry</h2></div><span>LIVE CONTEXT</span></div>
    <div className="sx-telemetry-grid">
      <article className="sx-telemetry-card"><div className="sx-card-top"><span>CAMERA NETWORK</span><b className={statusClass(cameraStatus)}>{String(cameraStatus).toUpperCase()}</b></div><div className="sx-big-status">{cameraStatus === "ACTIVE" ? "●" : "○"} <span>VISUAL INPUT</span></div><div className="sx-progress"><i style={{width: cameraStatus === "ACTIVE" ? "92%" : "24%"}} /></div><small>CAPTURE PIPELINE</small></article>
      <article className="sx-telemetry-card"><div className="sx-card-top"><span>THREAT REGISTER</span><b className={alerts.length ? "danger" : "good"}>{alerts.length ? "ATTENTION" : "CLEAR"}</b></div><div className="sx-threat-list"><div><span className="threat-dot red" />HIGH RISK <b>{highRisk}</b></div><div><span className="threat-dot amber" />ACTIVE ALERTS <b>{alerts.length}</b></div><div><span className="threat-dot green" />NORMAL <b>{Math.max(0, detections.length-highRisk)}</b></div></div></article>
      <article className="sx-telemetry-card sx-info-card"><div className="sx-card-top"><span>PLATFORM CAPABILITY</span><b className="good">READY</b></div><h3>Observe → Detect → Decide</h3><p>Camera intelligence, risk analysis, scenario simulation and vocational safety training in one operational surface.</p><button onClick={() => setShowInfo(!showInfo)}>{showInfo ? "HIDE SYSTEM NOTES" : "VIEW SYSTEM NOTES"} <span>→</span></button></article>
    </div>
    {showInfo && <div className="sx-system-note"><b>DATA INTEGRITY NOTE</b><span>Current UI state is driven by the shared application context. Live AI results require the FastAPI inference service and camera permission.</span></div>}
  </section>;
}
