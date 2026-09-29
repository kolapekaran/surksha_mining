import { useAppContext } from "../context/appcontext";

function Dashboard() {
  const {
    mlData,
    detections = [],
    alerts = [],
    cameraStatus = "INACTIVE",
    backendOnline = false,
  } = useAppContext();

  const fire = Boolean(mlData?.fire);
  const helmet = Boolean(mlData?.ppe);
  const fatigue = Boolean(mlData?.fatigue);
  const risk = Number(mlData?.riskScore || 0);

  return (
    <div className="suraksha-screen dashboard-screen" style={{ padding: "20px", color: "white" }}>
      <h1>AI Safety Dashboard</h1>

      <h2>🔥 Fire: {fire ? "YES" : "NO"}</h2>
      <h2>🪖 PPE: {helmet ? "DETECTED" : "NOT DETECTED"}</h2>
      <h2>😴 Fatigue: {fatigue ? "YES" : "NO"}</h2>
      <h2>⚠ Risk Score: {risk}%</h2>

      <p>Current detections: {detections.length}</p>
      <p>Active alerts: {alerts.length}</p>
      <p>Camera: {cameraStatus}</p>
      <p>Backend: {backendOnline ? "ONLINE" : "OFFLINE"}</p>
    </div>
  );
}

export default Dashboard;
