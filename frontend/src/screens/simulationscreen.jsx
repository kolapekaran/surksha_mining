
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
    <div
      className="suraksha-screen simulation-screen"
      style={{
        minHeight: "100vh",
        padding: "30px",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#f8fafc",
              }}
            >
              Industrial Safety Simulation
            </h1>

            <p
              style={{
                marginTop: "10px",
                color: "#cbd5e1",
                fontSize: "16px",
              }}
            >
              Simulate workplace hazards and evaluate recommended
              safety responses.
            </p>
          </div>

          <div
            style={{
              padding: "15px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "10px",
              minWidth: "180px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              SYSTEM STATUS
            </p>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color:
                  systemStatus === "ERROR"
                    ? "#ef4444"
                    : "#22c55e",
                fontSize: "16px",
              }}
            >
              {systemStatus}
            </strong>

            <p
              style={{
                margin: "10px 0 0",
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              Camera: {cameraStatus}
            </p>
          </div>
        </div>

        {/* Live Monitoring Summary */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              label: "DETECTIONS",
              value: detections.length,
              color: "#38bdf8",
            },
            {
              label: "HIGH-RISK EVENTS",
              value: highRiskDetections.length,
              color: "#ef4444",
            },
            {
              label: "MEDIUM-RISK EVENTS",
              value: mediumRiskDetections.length,
              color: "#f59e0b",
            },
            {
              label: "LOW-RISK EVENTS",
              value: lowRiskDetections.length,
              color: "#22c55e",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "20px",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "10px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                {item.label}
              </p>

              <h2
                style={{
                  margin: "10px 0 0",
                  color: item.color,
                  fontSize: "28px",
                }}
              >
                {item.value}
              </h2>
            </div>
          ))}
        </section>

        {/* Main Controls and Environment */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Simulation Controls */}
          <section
            style={{
              padding: "25px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Simulation Controls
            </h2>

            <label
              htmlFor="scenario"
              style={{
                display: "block",
                marginTop: "20px",
                marginBottom: "8px",
                color: "#cbd5e1",
              }}
            >
              Safety Scenario
            </label>

            <select
              id="scenario"
              value={selectedScenario}
              onChange={handleScenarioChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontSize: "15px",
              }}
            >
              {scenarios.map((scenario) => (
                <option
                  key={scenario.name}
                  value={scenario.name}
                >
                  {scenario.name}
                </option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button
                onClick={startSimulation}
                disabled={simulationRunning}
                style={{
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  cursor: simulationRunning
                    ? "not-allowed"
                    : "pointer",
                  opacity: simulationRunning ? 0.5 : 1,
                }}
              >
                Start
              </button>

              <button
                onClick={stopSimulation}
                disabled={!simulationRunning}
                style={{
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  cursor: !simulationRunning
                    ? "not-allowed"
                    : "pointer",
                  opacity: !simulationRunning ? 0.5 : 1,
                }}
              >
                Stop
              </button>

              <button
                onClick={resetSimulation}
                style={{
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#475569",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>

            <div
              style={{
                marginTop: "25px",
                padding: "15px",
                backgroundColor: "#0f172a",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#cbd5e1",
                }}
              >
                Simulation Status
              </p>

              <strong
                style={{
                  display: "block",
                  marginTop: "8px",
                  color: simulationRunning
                    ? "#22c55e"
                    : simulationStatus === "STOPPED"
                      ? "#f59e0b"
                      : "#38bdf8",
                  fontSize: "20px",
                }}
              >
                {simulationStatus}
              </strong>
            </div>
          </section>

          {/* Environment Preview */}
          <section
            style={{
              padding: "25px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Simulation Environment
            </h2>

            <div
              style={{
                height: "220px",
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                background:
                  "linear-gradient(135deg, #334155, #0f172a)",
                border: "1px solid #475569",
              }}
            >
              <div
                style={{
                  fontSize: "52px",
                  filter: simulationRunning
                    ? "drop-shadow(0 0 12px #22c55e)"
                    : "none",
                }}
              >
                🏭
              </div>

              <strong style={{ marginTop: "10px" }}>
                Industrial Work Area
              </strong>

              <span
                style={{
                  marginTop: "8px",
                  color: "#cbd5e1",
                }}
              >
                Frontend simulation preview
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
                color: "#cbd5e1",
              }}
            >
              <span>Environment</span>

              <strong
                style={{
                  color: simulationRunning
                    ? "#22c55e"
                    : "#facc15",
                }}
              >
                {simulationRunning ? "ACTIVE" : "STANDBY"}
              </strong>
            </div>
          </section>
        </div>

        {/* Scenario Analysis */}
        <section
          style={{
            marginTop: "20px",
            padding: "25px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              Scenario Analysis
            </h2>

            <span
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                backgroundColor: selectedScenarioData.color,
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              {selectedScenarioData.risk}
            </span>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              borderLeft:
                `5px solid ${selectedScenarioData.color}`,
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: selectedScenarioData.color,
              }}
            >
              {selectedScenarioData.name}
            </h3>

            <p style={{ color: "#e2e8f0" }}>
              {selectedScenarioData.description}
            </p>

            <p>
              <strong>Worker Status: </strong>

              <span
                style={{
                  color: selectedScenarioData.color,
                }}
              >
                {selectedScenarioData.workerStatus}
              </span>
            </p>

            <p>
              <strong>Recommended Response: </strong>
              {selectedScenarioData.action}
            </p>

            <p
              style={{
                marginBottom: 0,
                color: simulationRunning
                  ? "#22c55e"
                  : "#94a3b8",
              }}
            >
              {simulationRunning
                ? "Scenario is currently active."
                : "Start the simulation to activate this scenario."}
            </p>
          </div>
        </section>

        {/* Risk Meter */}
        <section
          style={{
            marginTop: "20px",
            padding: "25px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              Simulation Risk Meter
            </h2>

            <strong
              style={{
                color: selectedScenarioData.color,
                fontSize: "20px",
              }}
            >
              {selectedScenarioData.riskScore}%
            </strong>
          </div>

          <div
            style={{
              height: "18px",
              marginTop: "20px",
              overflow: "hidden",
              borderRadius: "20px",
              backgroundColor: "#475569",
            }}
          >
            <div
              style={{
                width: `${selectedScenarioData.riskScore}%`,
                height: "100%",
                borderRadius: "20px",
                backgroundColor: selectedScenarioData.color,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <p
            style={{
              marginBottom: 0,
              color: "#cbd5e1",
            }}
          >
            This is a predefined frontend simulation score.
            It is not an AI-generated risk prediction.
          </p>
        </section>

        {/* Current Captured Detections */}
        <section
          style={{
            marginTop: "20px",
            padding: "25px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Current Captured Detections
          </h2>

          {detections.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>
              No captured detections available. Capture a frame
              from the Camera screen first.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              {detections.map((detection, index) => (
                <div
                  key={`${detection.label}-${index}`}
                  style={{
                    padding: "15px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong>{detection.label}</strong>

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      Confidence: {detection.confidence}%
                    </p>
                  </div>

                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "15px",
                      backgroundColor: getRiskColor(
                        detection.risk
                      ),
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {detection.risk}
                  </span>
                </div>
              ))}
            </div>
          )}

          {alerts.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#450a0a",
                border: "1px solid #991b1b",
              }}
            >
              <strong style={{ color: "#fca5a5" }}>
                Active Safety Alerts: {alerts.length}
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  color: "#fecaca",
                  fontSize: "14px",
                }}
              >
                Review the Camera and Dashboard screens for
                complete alert information.
              </p>
            </div>
          )}
        </section>

        {/* Activity Log */}
        <section
          style={{
            marginTop: "20px",
            padding: "25px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              Activity Log
            </h2>

            <button
              onClick={() => setActivityLog([])}
              style={{
                padding: "8px 12px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#475569",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              Clear Log
            </button>
          </div>

          <div
            style={{
              marginTop: "20px",
              maxHeight: "220px",
              overflowY: "auto",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
            }}
          >
            {activityLog.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>
                No activity recorded.
              </p>
            ) : (
              activityLog.map((log, index) => (
                <p
                  key={`${log}-${index}`}
                  style={{
                    margin: "0 0 12px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #334155",
                    color: "#cbd5e1",
                    fontSize: "14px",
                  }}
                >
                  {log}
                </p>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SimulationScreen;