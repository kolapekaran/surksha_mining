import { useAppContext } from "../context/appcontext";

function Dashboard() {
  const { mlData, detections = [], alerts = [], cameraStatus = "INACTIVE", backendOnline = false } = useAppContext();
  const fire = Boolean(mlData?.fire);
  const helmet = Boolean(mlData?.ppe);
  const fatigue = Boolean(mlData?.fatigue);
  const risk = Math.max(0, Math.min(100, Number(mlData?.riskScore || 0)));

  const cards = [
    {code:"F01",label:"FIRE / SMOKE",value:fire?"DETECTED":"CLEAR",sub:"Thermal / visual hazard state",tone:fire?"danger":"safe",icon:"🔥"},
    {code:"P02",label:"PPE COMPLIANCE",value:helmet?"COMPLIANT":"CHECK REQUIRED",sub:"Protective equipment signal",tone:helmet?"safe":"warn",icon:"◈"},
    {code:"F03",label:"FATIGUE",value:fatigue?"FLAGGED":"CLEAR",sub:"Worker condition signal",tone:fatigue?"danger":"safe",icon:"◌"},
    {code:"R04",label:"RISK INDEX",value:risk+"%",sub:"Aggregated current risk",tone:risk>=70?"danger":risk>=30?"warn":"safe",icon:"△"}
  ];

  return <div className="suraksha-screen sx-dashboard"><div className="sx-page">
    <header className="sx-screen-head"><div><span className="sx-panel-code">ANALYTICS / 201</span><h1>Safety intelligence</h1><p>Live operational signals consolidated into a single risk picture.</p></div><div className="sx-head-metrics"><div><small>AI BACKEND</small><b className={backendOnline?"good":"bad"}>{backendOnline?"ONLINE":"OFFLINE"}</b></div><div><small>CAMERA</small><b>{cameraStatus}</b></div></div></header>

    <section className="sx-dashboard-kpis">{cards.map(c=><article className={"sx-dash-card "+c.tone} key={c.code}><span className="sx-card-code">{c.code}</span><span className="sx-dash-icon">{c.icon}</span><small>{c.label}</small><strong>{c.value}</strong><p>{c.sub}</p></article>)}</section>

    <section className="sx-dashboard-grid">
      <article className="sx-panel sx-risk-orbit"><div className="sx-panel-head"><div><span className="sx-panel-code">RISK / 202</span><h2>Current risk envelope</h2></div><span className={"sx-risk-state "+(risk>=70?"danger":risk>=30?"warn":"safe")}>{risk>=70?"HIGH":risk>=30?"ELEVATED":"CONTROLLED"}</span></div><div className="sx-orbit-wrap"><div className="sx-orbit o1"/><div className="sx-orbit o2"/><div className="sx-orbit o3"/><div className="sx-orbit-core"><strong>{risk}</strong><small>RISK INDEX</small></div><span className="sx-orbit-node a">FIRE</span><span className="sx-orbit-node b">PPE</span><span className="sx-orbit-node c">FATIGUE</span></div><div className="sx-scale"><span>0 SAFE</span><span>30 WATCH</span><span>60 HIGH</span><span>100 CRITICAL</span></div></article>
      <article className="sx-panel sx-event-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">EVENTS / 203</span><h2>Detection stream</h2></div><span className="sx-count-badge">{detections.length}</span></div>{detections.length?<div className="sx-event-list">{detections.map((d,i)=><div className="sx-event" key={d.id||i}><span className="sx-event-time">LIVE</span><div><b>{d.label}</b><small>{d.confidence==null?"Model signal":"Confidence "+d.confidence+"%"}</small></div><strong>{d.risk}</strong></div>)}</div>:<div className="sx-empty-state"><span>◎</span><b>STREAM CLEAR</b><small>No detection records are currently present.</small></div>}</article>
    </section>

    <section className="sx-status-matrix"><div className="sx-section-title"><div><span className="sx-panel-code">SYSTEM / 204</span><h2>Control matrix</h2></div><span>LIVE CONTEXT</span></div><div className="sx-matrix-grid"><div><span>VISION SENSOR</span><b className={cameraStatus==="ACTIVE"?"good":"warn"}>{cameraStatus}</b></div><div><span>AI PIPELINE</span><b className={backendOnline?"good":"bad"}>{backendOnline?"CONNECTED":"OFFLINE"}</b></div><div><span>DETECTIONS</span><b>{detections.length.toString().padStart(2,"0")}</b></div><div><span>ALERT QUEUE</span><b className={alerts.length?"warn":"good"}>{alerts.length.toString().padStart(2,"0")}</b></div></div></section>
  </div></div>;
}
export default Dashboard;