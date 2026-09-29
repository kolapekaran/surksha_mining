import { useState } from "react";
import { useAppContext } from "../context/appcontext";

export default function ReportScreen(){
 const [generated,setGenerated]=useState(false);
 const {detections=[],alerts=[],cameraStatus="INACTIVE",systemStatus="READY"}=useAppContext();
 const critical=detections.filter(d=>["CRITICAL","HIGH"].includes(String(d.risk).toUpperCase())).length;
 const medium=detections.filter(d=>String(d.risk).toUpperCase()==="MEDIUM").length;
 const low=detections.filter(d=>String(d.risk).toUpperCase()==="LOW").length;
 const overall=critical?"HIGH":medium?"MEDIUM":detections.length?"LOW":"NO DATA";
 const now=new Date();
 return <section className="sx-page sx-report-page">
  <div className="sx-page-heading"><div><div className="sx-eyebrow">DOCUMENTATION / SAFETY INTELLIGENCE</div><h1>Incident <span>Report</span></h1><p>Structured operational record generated from the current safety context.</p></div><button className="sx-outline-button" onClick={()=>window.print()}>PRINT / EXPORT</button></div>
  <div className="sx-report-hero"><div><span>REPORT ID</span><strong>SRK-{now.getFullYear()}-{String(now.getTime()).slice(-6)}</strong></div><div><span>DATE</span><strong>{now.toLocaleDateString()}</strong></div><div><span>TIME</span><strong>{now.toLocaleTimeString()}</strong></div><div><span>OVERALL RISK</span><strong className={overall.toLowerCase()}>{overall}</strong></div></div>
  <div className="sx-report-grid">
   <div className="sx-report-main"><div className="sx-section-head"><div><span className="sx-section-code">FINDINGS / 01</span><h2>Detection records</h2></div><span>{detections.length} TOTAL</span></div>{detections.length===0?<div className="sx-empty-report"><div>00</div><b>NO FINDINGS RECORDED</b><span>Capture a frame in Live Camera to populate this report.</span></div>:detections.map((d,i)=><article className="sx-report-row" key={d.id||i}><span>{String(i+1).padStart(2,"0")}</span><div><b>{d.label||"Detection"}</b><small>CONFIDENCE {d.confidence??"—"}%</small></div><strong className={String(d.risk||"").toLowerCase()}>{d.risk||"UNKNOWN"}</strong></article>)}</div>
   <aside className="sx-report-side"><div className="sx-section-head"><div><span className="sx-section-code">SUMMARY</span><h2>Risk profile</h2></div></div><div className="sx-report-bars"><div><span>HIGH / CRITICAL <b>{critical}</b></span><i><em style={{width:`${detections.length?critical/detections.length*100:0}%`}}/></i></div><div><span>MEDIUM <b>{medium}</b></span><i><em className="amber" style={{width:`${detections.length?medium/detections.length*100:0}%`}}/></i></div><div><span>LOW <b>{low}</b></span><i><em className="green" style={{width:`${detections.length?low/detections.length*100:0}%`}}/></i></div></div><div className="sx-report-stat"><span>ACTIVE ALERTS</span><b>{alerts.length.toString().padStart(2,"0")}</b></div><div className="sx-report-stat"><span>CAMERA</span><b>{String(cameraStatus).toUpperCase()}</b></div><div className="sx-report-stat"><span>SYSTEM</span><b>{String(systemStatus).toUpperCase()}</b></div></aside>
  </div>
  <div className="sx-report-actions"><button className="sx-primary-button" onClick={()=>setGenerated(true)}>{generated?"REPORT GENERATED ✓":"GENERATE SAFETY REPORT"}</button>{generated&&<span>Report prepared from current frontend detection context.</span>}</div>
 </section>
}