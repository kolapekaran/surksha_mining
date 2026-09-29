import { useAppContext } from "../context/appcontext";

function StatusCard({ code, label, value, detail, tone }) {
  return <article className={`sx-ai-card ${tone}`}><div className="sx-ai-code">{code}</div><div className="sx-ai-label">{label}</div><div className="sx-ai-value">{value}</div><div className="sx-ai-detail">{detail}</div><div className="sx-ai-scan" /></article>;
}

export default function Dashboard() {
  const { mlData, detections = [], alerts = [], cameraStatus = "INACTIVE", backendOnline = false } = useAppContext();
  const fire = Boolean(mlData?.fire), ppe = Boolean(mlData?.ppe), fatigue = Boolean(mlData?.fatigue);
  const risk = Math.max(0, Math.min(100, Number(mlData?.riskScore || 0)));
  const riskTone = risk >= 85 ? "critical" : risk >= 60 ? "high" : risk >= 30 ? "medium" : "safe";

  return <section className="sx-page">
    <div className="sx-page-heading"><div><div className="sx-eyebrow">AI SAFETY ENGINE / DIAGNOSTICS</div><h1>Intelligence <span>Matrix</span></h1><p>Current machine-vision state and safety inference signals.</p></div><div className="sx-live-badge"><span /> {backendOnline ? "INFERENCE LINK ACTIVE" : "INFERENCE LINK OFFLINE"}</div></div>
    <div className="sx-ai-grid">
      <StatusCard code="F-01" label="FIRE / SMOKE" value={fire ? "DETECTED" : "CLEAR"} detail="VISUAL CLASSIFIER" tone={fire ? "critical" : "safe"} />
      <StatusCard code="P-02" label="PPE COMPLIANCE" value={ppe ? "COMPLIANT" : "VIOLATION"} detail="HELMET DETECTION" tone={ppe ? "safe" : "high"} />
      <StatusCard code="F-03" label="FATIGUE" value={fatigue ? "DETECTED" : "CLEAR"} detail="WORKER STATE" tone={fatigue ? "high" : "safe"} />
      <StatusCard code="R-04" label="COMPOSITE RISK" value={`${risk}%`} detail="FUSED RISK SCORE" tone={riskTone} />
    </div>
    <div className="sx-analysis-grid">
      <section className="sx-risk-orbit"><div className="sx-section-head"><div><span className="sx-section-code">ANALYSIS / 01</span><h2>Risk field</h2></div><span>0—100 SCALE</span></div><div className="sx-orbit-wrap"><div className={`sx-orbit sx-orbit-${riskTone}`}><div className="sx-orbit-inner"><strong>{risk}</strong><span>RISK</span></div></div><div className="sx-orbit-label left">LOW<br /><b>0—29</b></div><div className="sx-orbit-label right">CRITICAL<br /><b>85—100</b></div></div><div className="sx-risk-footer"><span>MODEL STATUS</span><b className={backendOnline ? "good" : "warn"}>{backendOnline ? "PROCESSING" : "WAITING FOR BACKEND"}</b></div></section>
      <section className="sx-event-panel"><div className="sx-section-head"><div><span className="sx-section-code">ANALYSIS / 02</span><h2>Detection stream</h2></div><span>{detections.length} EVENTS</span></div>{detections.length === 0 ? <div className="sx-empty"><div className="sx-empty-ring">✓</div><b>NO ACTIVE DETECTIONS</b><span>Start camera monitoring to populate the stream.</span></div> : <div className="sx-event-list">{detections.slice(0,8).map((d,i)=><div className="sx-event-row" key={d.id || i}><span className="sx-event-num">{String(i+1).padStart(2,"0")}</span><div><b>{d.label || "Detection"}</b><small>CONFIDENCE {d.confidence ?? "—"}%</small></div><strong className={String(d.risk).toLowerCase()}>{d.risk || "UNKNOWN"}</strong></div>)}</div>}</section>
    </div>
    <div className="sx-bottom-strip"><div><span>CAMERA</span><b>{String(cameraStatus).toUpperCase()}</b></div><div><span>ALERT QUEUE</span><b>{alerts.length.toString().padStart(2,"0")}</b></div><div><span>DETECTIONS</span><b>{detections.length.toString().padStart(2,"0")}</b></div><div><span>ENGINE</span><b>{backendOnline ? "ONLINE" : "OFFLINE"}</b></div></div>
  </section>;
}
