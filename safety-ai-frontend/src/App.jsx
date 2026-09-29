
import { useState } from "react";
import SafetyGame from "./safety-game/App";
import "./safety-game/styles.css";

import { AppProvider } from "./context/appcontext";

import Home from "./screens/home";
import CameraScreen from "./screens/camerascreen";
import Dashboard from "./screens/dashboard";
import ReportScreen from "./screens/reportscreen";
import SimulationScreen from "./screens/simulationscreen";

function AppContent() {
  const [activeScreen, setActiveScreen] = useState("camera");

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <Home />;

      case "camera":
        return <CameraScreen />;

      case "dashboard":
        return <Dashboard />;

      case "reports":
        return <ReportScreen />;

      case "simulation":
        return <SimulationScreen />;

      case "safety-game":
        return <SafetyGame />;

      default:
        return <CameraScreen />;
    }
  };

  const navigationItems = [
    { id: "home", label: "Home" },
    { id: "camera", label: "Camera Monitoring" },
    { id: "dashboard", label: "Dashboard" },
    { id: "reports", label: "Reports" },
    { id: "simulation", label: "Simulation" },
    { id: "safety-game", label: "Safety Training Game" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
      }}
    >
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "15px 20px",
          backgroundColor: "#111827",
          borderBottom: "1px solid #334155",
        }}
      >
        <strong
          style={{
            marginRight: "20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Safety AI
        </strong>

        {navigationItems.map((item) => {
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              style={{
                padding: "10px 15px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: isActive
                  ? "#2563eb"
                  : "#334155",
                color: "#ffffff",
                fontWeight: isActive ? "bold" : "normal",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <main>{renderScreen()}</main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;