
import { useState } from "react";
import { useAppContext } from "../context/appcontext";

function SimulationScreen() {
  const {
    detections,
    alerts,
    cameraStatus,
    systemStatus,
  } = useAppContext();

  const [simulationRunning, setSimulationRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("No Helmet");
  const [simulationStatus, setSimulationStatus] = useState("READY");

  const [activityLog, setActivityLog] = useState([
    "Simulation system initialized.",
  ]);

  const scenarios = [
    {
      name: "No Helmet",
      risk: "HIGH",
      riskScore: 75,
      workerStatus: "UNSAFE",
      description:
        "A worker has been detected without the required helmet.",
      action:
        "Issue an immediate safety warning and instruct the worker to wear a helmet.",
      color: "#ef4444",
    },
    {
      name: "Fire Hazard",
      risk: "CRITICAL",
      riskScore: 100,
      workerStatus: "DANGER",
      description:
        "A possible fire hazard has been detected in the monitored area.",
      action:
        "Trigger the emergency response procedure and evacuate the affected area.",
      color: "#dc2626",
    },
    {
      name: "Unsafe Posture",
      risk: "MEDIUM",
      riskScore: 50,
      workerStatus: "AT RISK",
      description:
        "A potentially unsafe worker posture has been detected.",
      action:
        "Warn the worker and recommend a safer working posture.",
      color: "#f59e0b",
    },
    {
      name: "Safe Worker",
      risk: "LOW",
      riskScore: 15,
      workerStatus: "SAFE",
      description:
        "The worker is detected with the required safety conditions.",
      action:
        "Continue normal monitoring and maintain safety compliance.",
      color: "#22c55e",
    },
  ];

  const selectedScenarioData =
    scenarios.find(
      (scenario) => scenario.name === selectedScenario
    ) || scenarios[0];

  const highRiskDetections = detections.filter(
    (detection) =>
      detection.risk === "HIGH" ||
      detection.risk === "CRITICAL"
  );

  const mediumRiskDetections = detections.filter(
    (detection) => detection.risk === "MEDIUM"
  );

  const lowRiskDetections = detections.filter(
    (detection) => detection.risk === "LOW"
  );

  const addLog = (message) => {
    const currentTime = new Date().toLocaleTimeString();

    setActivityLog((previousLogs) => [
      `[${currentTime}] ${message}`,
      ...previousLogs,
    ]);
  };

  const startSimulation = () => {
    if (simulationRunning) {
      return;
    }

    setSimulationRunning(true);
    setSimulationStatus("RUNNING");

    addLog(
      `Simulation started: ${selectedScenarioData.name} scenario.`
    );
  };

  const stopSimulation = () => {
    if (!simulationRunning) {
      return;
    }

    setSimulationRunning(false);
    setSimulationStatus("STOPPED");

    addLog("Simulation stopped by operator.");
  };

  const resetSimulation = () => {
    setSimulationRunning(false);
    setSimulationStatus("READY");
    setSelectedScenario("No Helmet");
    setActivityLog(["Simulation reset by operator."]);
  };

  const handleScenarioChange = (event) => {
    const scenarioName = event.target.value;

    setSelectedScenario(scenarioName);

    addLog(`Scenario selected: ${scenarioName}.`);
  };

  const getRiskColor = (risk) => {
    if (risk === "CRITICAL") return "#dc2626";
    if (risk === "HIGH") return "#ef4444";
    if (risk === "MEDIUM") return "#f59e0b";
    if (risk === "LOW") return "#22c55e";

    return "#94a3b8";
  };

  return (
    <div className="suraksha-screen sx-simulation"><div className="sx-page">
      <header className="sx-screen-head"><div><span className="sx-panel-code">SIMULATION / 301</span><h1>Response laboratory</h1><p>Rehearse safety scenarios, observe risk escalation, and review response actions.</p></div><div className={"sx-sim-status "+(simulationRunning?"running":"idle")}><span/>{simulationRunning?"SIMULATION RUNNING":"READY TO SIMULATE"}</div></header>
      <div className="sx-sim-layout">
        <aside className="sx-panel sx-sim-controls"><span className="sx-panel-code">SCENARIO CONTROL</span><h2>Choose hazard</h2><div className="sx-scenario-list">{scenarios.map(s=><button key={s.name} className={selectedScenario===s.name?"selected":""} onClick={()=>setSelectedScenario(s.name)}><span className="sx-scenario-dot" style={{background:s.color}}/><div><b>{s.name}</b><small>{s.risk} · {s.riskScore}%</small></div><span>›</span></button>)}</div><button className="sx-primary-action sx-run-button" onClick={runSimulation} disabled={simulationRunning}>{simulationRunning?"SIMULATION IN PROGRESS…":"RUN SCENARIO"} <span>↗</span></button></aside>
        <main className="sx-sim-main">
          <section className="sx-panel sx-scenario-hero"><div className="sx-sim-grid"/><div className="sx-scenario-copy"><span className="sx-panel-code">ACTIVE SCENARIO</span><h2>{selectedScenarioData.name}</h2><p>{selectedScenarioData.description}</p><div className="sx-sim-tags"><span>{selectedScenarioData.risk} RISK</span><span>{selectedScenarioData.workerStatus}</span></div></div><div className="sx-risk-dial"><div><strong>{selectedScenarioData.riskScore}</strong><small>RISK</small></div></div></section>
          <section className="sx-sim-response"><div className="sx-panel-head"><div><span className="sx-panel-code">RESPONSE / 302</span><h2>Recommended operator action</h2></div></div><div className="sx-action-command"><span>!</span><div><b>{selectedScenarioData.action}</b><small>Apply the response protocol appropriate to the selected hazard.</small></div></div></section>
          <section className="sx-sim-timeline"><div className="sx-panel-head"><div><span className="sx-panel-code">EVENT TRACE / 303</span><h2>Simulation timeline</h2></div></div><div className="sx-timeline"><div className="active"><i>01</i><span>SCENARIO LOADED</span><small>{simulationStatus}</small></div><div className={simulationRunning?"active":""}><i>02</i><span>RISK PROPAGATION</span><small>{simulationRunning?"PROCESSING":"STANDBY"}</small></div><div><i>03</i><span>RESPONSE DECISION</span><small>OPERATOR INPUT</small></div><div><i>04</i><span>OUTCOME</span><small>AWAITING RUN</small></div></div></section>
        </main>
      </div>
      <section className="sx-panel sx-sim-log"><div className="sx-panel-head"><div><span className="sx-panel-code">SYSTEM LOG / 304</span><h2>Activity trace</h2></div><button onClick={()=>setActivityLog([])}>CLEAR</button></div><div className="sx-log-list">{activityLog.length?activityLog.map((log,i)=><div key={i}><span>{String(i+1).padStart(2,"0")}</span><p>{log}</p><small>EVENT</small></div>):<div className="sx-empty-state"><span>—</span><b>LOG EMPTY</b></div>}</div></section>
    </div></div>
  );
}

export default SimulationScreen;