import { useState } from "react";
import { useAppContext } from "../context/appcontext";

const scenarios = [
  {name:"NO HELMET",risk:75,tone:"high",desc:"Worker enters an active work zone without required head protection.",action:"Issue immediate PPE warning and remove worker from exposure."},
  {name:"FIRE HAZARD",risk:100,tone:"critical",desc:"Possible fire event detected near an occupied operational area.",action:"Trigger emergency response and evacuate the affected zone."},
  {name:"FATIGUE EVENT",risk:60,tone:"medium",desc:"Worker shows a fatigue-related safety signal during operation.",action:"Pause hazardous work and initiate worker welfare check."},
  {name:"ELECTRICAL RISK",risk:90,tone:"critical",desc:"Potential electrical exposure identified near equipment.",action:"Isolate the energy source before permitting intervention."}
];

export default function SimulationScreen(){
 const {detections=[],alerts=[],cameraStatus="INACTIVE",systemStatus="READY"}=useAppContext();
 const [selected,setSelected]=useState(0);
 const [running,setRunning]=useState(false);
 const [tick,setTick]=useState(0);
 const [log,setLog]=useState(["SIMULATION CORE INITIALIZED"]);
 const s=scenarios[selected];
 const run=()=>{
   setRunning(true);
   setTick(t=>t+1);
   setLog(l=>["[T+"+String(tick+1).padStart(2,"0")+"] SCENARIO EXECUTED: "+s.name,"[T+"+String(tick+1).padStart(2,"0")+"] RESPONSE: "+s.action,...l].slice(0,7));
   setTimeout(()=>setRunning(false),1800);
 };
 return <section className="sx-page sx-sim-page">
  <div className="sx-page-heading"><div><div className="sx-eyebrow">DIGITAL SCENARIO ENGINE / TRAINING</div><h1>Safety <span>Simulator</span></h1><p>Test response decisions against controlled industrial hazard scenarios.</p></div><div className={"sx-sim-state "+(running?"running":"")}><span />{running?"SCENARIO RUNNING":"ENGINE READY"}</div></div>
  <div className="sx-sim-layout">
   <section className="sx-scenario-stage"><div className="sx-stage-grid" /><div className="sx-stage-header"><span>SIMULATION VIEW / ZONE 01</span><b>LIVE PREVIEW</b></div><div className={"sx-hazard-visual "+s.tone}><div className="sx-hazard-ring" /><div className="sx-worker">●</div><div className="sx-hazard-core">!</div><div className="sx-stage-lines"><i/><i/><i/></div></div><div className="sx-stage-footer"><span>SCENARIO</span><b>{s.name}</b><span>RISK</span><strong className={s.tone}>{s.risk}%</strong></div></section>
   <section className="sx-scenario-list"><div className="sx-section-head"><div><span className="sx-section-code">SCENARIOS</span><h2>Select event</h2></div></div>{scenarios.map((x,i)=><button key={x.name} className={selected===i?"selected":""} onClick={()=>setSelected(i)}><span className="sx-scenario-no">0{i+1}</span><div><b>{x.name}</b><small>{x.desc}</small></div><strong className={x.tone}>{x.risk}</strong></button>)}<button className="sx-run-button" onClick={run} disabled={running}>{running?"RUNNING SIMULATION":"RUN SCENARIO"} <span>→</span></button></section>
  </div>
  <div className="sx-sim-bottom"><section className="sx-response-panel"><span className="sx-section-code">EXPECTED RESPONSE</span><h3>{s.action}</h3><div className="sx-response-steps"><span>01 / DETECT</span><span>02 / DECIDE</span><span>03 / RESPOND</span><span>04 / RECOVER</span></div></section><section className="sx-log-panel"><div className="sx-section-head"><div><span className="sx-section-code">EVENT LOG</span><h2>Simulation feed</h2></div></div>{log.map((x,i)=><div key={i}>{x}</div>)}</section></div>
  <div className="sx-context-strip"><span>LIVE CAMERA {cameraStatus}</span><span>ACTIVE ALERTS {alerts.length}</span><span>SYSTEM {systemStatus}</span><span>DETECTIONS {detections.length}</span></div>
 </section>
}