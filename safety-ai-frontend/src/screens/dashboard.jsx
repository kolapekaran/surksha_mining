import { useAppContext } from "../context/appcontext";

function Dashboard() {
  const { mlData } = useAppContext();

  const fire = mlData?.fire;
  const helmet = mlData?.ppe;
  const fatigue = mlData?.fatigue;
  const risk = mlData?.riskScore || 0;

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>AI Safety Dashboard</h1>

      <h2>🔥 Fire: {fire ? "YES" : "NO"}</h2>
      <h2>🪖 Helmet: {helmet ? "YES" : "NO"}</h2>
      <h2>😴 Fatigue: {fatigue ? "YES" : "NO"}</h2>
      <h2>⚠ Risk Score: {risk}</h2>
    </div>
  );
}

export default Dashboard;