import { useState } from "react";
import { AppProvider } from "./context/appcontext";
import Home from "./screens/home";
import CameraScreen from "./screens/camerascreen";
import Dashboard from "./screens/dashboard";
import ReportScreen from "./screens/reportscreen";
import SimulationScreen from "./screens/simulationscreen";
import SafetyTraining from "./screens/safetytraining";

function AppContent() {
  const [activeScreen, setActiveScreen] = useState("home");
  const navigationItems = [
    ["home","COMMAND"],
    ["camera","VISION"],
    ["dashboard","INTELLIGENCE"],
    ["reports","EVIDENCE"],
    ["simulation","SIMULATOR"],
    ["training","TRAINING"]
  ];
  const renderScreen=()=>({
    home:<Home/>,camera:<CameraScreen/>,dashboard:<Dashboard/>,reports:<ReportScreen/>,simulation:<SimulationScreen/>,training:<SafetyTraining/>
  }[activeScreen]||<Home/>);

  return <div className="suraksha-shell">
    <nav className="sx-topbar">
      <div className="sx-nav-inner">
        <button className="sx-brand sx-brand-button" onClick={()=>setActiveScreen("home")}><span className="sx-brand-mark">S</span><span><b>SURAKSHA</b><small>SAFETY INTELLIGENCE SYSTEM</small></span></button>
        <div className="sx-main-nav">{navigationItems.map(([id,label],i)=><button key={id} className={"sx-nav-item "+(activeScreen===id?"active":"")} onClick={()=>setActiveScreen(id)}><span>0{i+1}</span>{label}</button>)}</div>
        <div className="sx-top-status"><span className="sx-live-dot"/> CONTROL LINK <b>READY</b></div>
      </div>
    </nav>
    <main className="sx-app-main" key={activeScreen}>{renderScreen()}</main>
    <div className="sx-footer-bar"><span>SURAKSHA // INDUSTRIAL SAFETY</span><span>LOCAL CONTROL NODE</span><span>v1.0 · OPERATIONAL UI</span></div>
  </div>;
}
function App(){return <AppProvider><AppContent/></AppProvider>}
export default App;