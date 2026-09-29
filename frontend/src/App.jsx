import { useState } from "react";
import { AppProvider, useAppContext } from "./context/appcontext";
import Home from "./screens/home";
import CameraScreen from "./screens/camerascreen";
import Dashboard from "./screens/dashboard";
import ReportScreen from "./screens/reportscreen";
import SimulationScreen from "./screens/simulationscreen";
import SafetyTraining from "./screens/safetytraining";

const navigation = [
  { id: "home", label: "Command", short: "CMD" },
  { id: "camera", label: "Live Camera", short: "CAM" },
  { id: "dashboard", label: "AI Status", short: "AI" },
  { id: "simulation", label: "Simulator", short: "SIM" },
  { id: "reports", label: "Reports", short: "RPT" },
  { id: "training", label: "Training", short: "TRN" },
];

function AppContent() {
  const [activeScreen, setActiveScreen] = useState("home");
  const { backendOnline, systemStatus, alerts = [] } = useAppContext();

  const renderScreen = () => {
    switch (activeScreen) {
      case "camera": return <CameraScreen />;
      case "dashboard": return <Dashboard />;
      case "simulation": return <SimulationScreen />;
      case "reports": return <ReportScreen />;
      case "training": return <SafetyTraining />;
      default: return <Home />;
    }
  };

  return (
    <div className="sx-app">
      <header className="sx-header">
        <div className="sx-brand-block">
          <div className="sx-brand-mark"><span>S</span></div>
          <div>
            <div className="sx-brand-title">SURAKSHA <b>AI</b></div>
            <div className="sx-brand-sub">INDUSTRIAL SAFETY COMMAND</div>
          </div>
        </div>
        <div className="sx-header-center"><span className="sx-live-dot" /><span>MONITORING NETWORK</span><i /><span>ZONE 01 / MINING OPERATIONS</span></div>
        <div className="sx-header-status">
          <div className={\`sx-connection \${backendOnline ? "online" : "offline"}\`}><span />{backendOnline ? "BACKEND ONLINE" : "BACKEND OFFLINE"}</div>
          <div className="sx-alert-counter">{alerts.length.toString().padStart(2, "0")} ALERTS</div>
        </div>
      </header>

      <div className="sx-layout">
        <aside className="sx-sidebar">
          <div className="sx-side-label">OPERATIONS</div>
          <nav>{navigation.map((item, index) => (
            <button key={item.id} className={activeScreen === item.id ? "active" : ""} onClick={() => setActiveScreen(item.id)}>
              <span className="sx-nav-index">0{index + 1}</span><span className="sx-nav-name">{item.label}</span><span className="sx-nav-short">{item.short}</span>
            </button>
          ))}</nav>
          <div className="sx-sidebar-bottom"><div className="sx-mini-status"><span /> SYSTEM {String(systemStatus).toUpperCase()}</div><div className="sx-version">SURAKSHA / v2.0</div></div>
        </aside>
        <main className="sx-main">{renderScreen()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}
