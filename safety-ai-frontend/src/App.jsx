import { useState } from "react";
import Home from "./screens/home";
import CameraScreen from "./screens/camerascreen";
import Dashboard from "./screens/dashboard";
import ReportScreen from "./screens/reportscreen";
import SimulationScreen from "./screens/simulationscreen";

function App() {
  const [activeScreen, setActiveScreen] = useState("camera");

  const screens = {
    home: <Home />,
    camera: <CameraScreen />,
    dashboard: <Dashboard />,
    reports: <ReportScreen />,
    simulation: <SimulationScreen />,
    training: (
      <section style={{ minHeight: "calc(100vh - 70px)", background: "#f3f6fb" }}>
        <iframe
          title="SURAKSHA Safety Training Game"
          src={import.meta.env.VITE_GAME_URL || "http://localhost:5174"}
          style={{ display: "block", width: "100%", height: "calc(100vh - 70px)", border: 0 }}
          allow="camera; microphone"
        />
      </section>
    ),
  };

  const navigationItems = [
    { id: "home", label: "Home" },
    { id: "camera", label: "Camera Monitoring" },
    { id: "dashboard", label: "Dashboard" },
    { id: "reports", label: "Reports" },
    { id: "simulation", label: "Simulation" },
    { id: "training", label: "Safety Training" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#ffffff" }}>
      <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", padding: "15px 20px", backgroundColor: "#111827", borderBottom: "1px solid #334155" }}>
        <strong style={{ marginRight: "20px" }}>SURAKSHA</strong>
        {navigationItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} onClick={() => setActiveScreen(item.id)} aria-current={isActive ? "page" : undefined}
              style={{ padding: "10px 15px", border: "none", borderRadius: "6px", backgroundColor: isActive ? "#2563eb" : "#334155", color: "#ffffff", fontWeight: isActive ? "bold" : "normal", cursor: "pointer" }}>
              {item.label}
            </button>
          );
        })}
      </nav>
      <main>{screens[activeScreen] || screens.camera}</main>
    </div>
  );
}

export default App;
