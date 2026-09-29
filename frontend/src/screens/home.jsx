
import { useState } from "react";
import { useAppContext } from "../context/appcontext";

function Home() {
  const [showInfo, setShowInfo] = useState(false);

  const {
    detections = [],
    alerts = [],
    cameraStatus = "INACTIVE",
    systemStatus = "READY",
  } = useAppContext();

  const highRiskCount = detections.filter((detection) => {
    const risk = String(detection.risk || "").toUpperCase();
    return risk === "HIGH" || risk === "CRITICAL";
  }).length;

  const getStatusColor = (status) => {
    const normalizedStatus = String(status).toUpperCase();

    if (
      normalizedStatus === "ACTIVE" ||
      normalizedStatus === "MONITORING" ||
      normalizedStatus === "READY" ||
      normalizedStatus === "FRAME_CAPTURED"
    ) {
      return "#86efac";
    }

    if (
      normalizedStatus === "ERROR" ||
      normalizedStatus === "FAILED"
    ) {
      return "#f87171";
    }

    if (
      normalizedStatus === "STARTING" ||
      normalizedStatus === "STOPPED"
    ) {
      return "#facc15";
    }

    return "#cbd5e1";
  };

  const cardStyle = {
    padding: "22px",
    border: "1px solid #334155",
    borderRadius: "14px",
    backgroundColor: "#1e293b",
    textAlign: "left",
    boxSizing: "border-box",
  };

  const smallLabelStyle = {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };

  return (
    <div className="suraksha-screen sx-home"><div className="sx-page">
      <header className="sx-command-hero">
        <div className="sx-hero-copy">
          <div className="sx-eyebrow"><span className="sx-live-dot" /> SURAKSHA // INDUSTRIAL SAFETY COMMAND</div>
          <h1>Safety intelligence,<br/><em>in real time.</em></h1>
          <p>Monitor workplace conditions, surface hazards, and move from detection to response through one operational control layer.</p>
          <div className="sx-hero-actions"><div className="sx-status-pill"><span className="sx-status-light" /> SYSTEM {String(systemStatus).toUpperCase()}</div><div className="sx-status-pill sx-status-muted">CAMERA {String(cameraStatus).toUpperCase()}</div></div>
        </div>
        <div className="sx-hero-radar"><div className="sx-radar-grid" /><div className="sx-radar-ring r1" /><div className="sx-radar-ring r2" /><div className="sx-radar-ring r3" /><div className="sx-radar-sweep" /><div className="sx-radar-core">SX<span>AI</span></div><div className="sx-radar-label l1">LIVE MONITOR</div><div className="sx-radar-label l2">THREAT MAP</div></div>
      </header>
      <section className="sx-kpi-grid">
        <article className="sx-kpi-card cyan"><span className="sx-kpi-index">01</span><small>DETECTIONS</small><strong>{detections.length}</strong><b>CURRENT OBJECTS</b><div className="sx-kpi-line"><i style={{width:Math.min(100,detections.length*12)+"%"}} /></div></article>
        <article className="sx-kpi-card amber"><span className="sx-kpi-index">02</span><small>ACTIVE ALERTS</small><strong>{alerts.length}</strong><b>{alerts.length?"RESPONSE REQUIRED":"NO ACTIVE EVENTS"}</b><div className="sx-kpi-line"><i style={{width:Math.min(100,alerts.length*20)+"%"}} /></div></article>
        <article className="sx-kpi-card red"><span className="sx-kpi-index">03</span><small>HIGH / CRITICAL</small><strong>{highRiskCount}</strong><b>RISK EVENTS</b><div className="sx-kpi-line"><i style={{width:Math.min(100,highRiskCount*20)+"%"}} /></div></article>
        <article className="sx-kpi-card green"><span className="sx-kpi-index">04</span><small>CONTROL STATE</small><strong className="sx-kpi-state">{String(systemStatus).toUpperCase()}</strong><b>PLATFORM STATUS</b><div className="sx-kpi-line"><i style={{width:"100%"}} /></div></article>
      </section>
      <section className="sx-home-grid">
        <article className="sx-panel sx-live-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">LIVE / 001</span><h2>Operational picture</h2></div><span className="sx-live-badge"><span /> LIVE</span></div><div className="sx-ops-visual"><div className="sx-grid-floor" /><div className="sx-ops-node main">CONTROL<br/><b>CENTER</b></div><div className="sx-ops-node n1">CAMERA<br/><b>{String(cameraStatus).toUpperCase()}</b></div><div className="sx-ops-node n2">AI ENGINE<br/><b>{detections.length?"EVENT":"STANDBY"}</b></div><div className="sx-ops-node n3">ALERT BUS<br/><b>{alerts.length?"ACTIVE":"CLEAR"}</b></div><div className="sx-flow f1"/><div className="sx-flow f2"/><div className="sx-flow f3"/></div><div className="sx-ops-footer"><span><i className="dot green"/> SENSOR LINK</span><span><i className="dot cyan"/> AI PIPELINE</span><span><i className="dot amber"/> RESPONSE LAYER</span></div></article>
        <aside className="sx-panel sx-brief-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">STATUS / 002</span><h2>Situation brief</h2></div></div><div className="sx-brief-item"><span className="sx-brief-icon">◉</span><div><b>Camera network</b><small>{String(cameraStatus).toUpperCase()} · monitoring state</small></div><strong className="good">●</strong></div><div className="sx-brief-item"><span className="sx-brief-icon">!</span><div><b>Safety alerts</b><small>{alerts.length?alerts.length+" event(s) awaiting review":"No active safety alerts"}</small></div><strong className={alerts.length?"warn":"good"}>{alerts.length}</strong></div><div className="sx-brief-item"><span className="sx-brief-icon">◇</span><div><b>Risk records</b><small>{detections.length?detections.length+" detection record(s)":"Awaiting detection data"}</small></div><strong>{detections.length}</strong></div><div className="sx-brief-callout"><span>OPERATOR NOTE</span><p>Use Camera Monitoring for live inspection. Use Simulation to rehearse response paths before an incident.</p></div></aside>
      </section>
      <section className="sx-section-block"><div className="sx-section-title"><div><span className="sx-panel-code">MISSION / 003</span><h2>Response modules</h2></div><span>6 OPERATIONAL VIEWS</span></div><div className="sx-module-grid">{[["01","CAMERA","Live visual monitoring","◉"],["02","DASHBOARD","Risk intelligence","◈"],["03","REPORTS","Inspection evidence","▤"],["04","SIMULATION","Response rehearsal","△"],["05","TRAINING","Safety scenarios","◆"],["06","ALERTS","Incident response","!"]].map(([n,t,d,icon])=><div className="sx-module-card" key={n}><span className="sx-module-no">{n}</span><strong>{icon}</strong><h3>{t}</h3><p>{d}</p><span className="sx-module-arrow">↗</span></div>)}</div></section>
      {showInfo&&<section className="sx-disclosure"><span className="sx-panel-code">PLATFORM NOTE</span><p>Current detection records may use application-level or mock data. A connected production AI backend should be verified separately before treating results as live AI predictions.</p></section>}
      <button className="sx-info-toggle" onClick={()=>setShowInfo(!showInfo)}>{showInfo?"Hide platform note":"View platform status note"} <span>{showInfo?"−":"+"}</span></button>
    </div></div>
  );
}

export default Home;