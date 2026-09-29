import { useEffect, useRef, useState } from "react";
import Overlay from "../components/camera/overlay";
import AlertBox from "../components/alerts/alertbox";
import SoundAlert from "../components/alerts/soundalert";
import RiskMeter from "../components/ui/riskmeter";
import { analyzeFrame } from "../services/api";
import { useAppContext } from "../context/appcontext";

function labelFor(key) { return String(key).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

function toDetections(result) {
  if (!result || typeof result !== "object") return [];
  if (Array.isArray(result.boxes)) return result.boxes.map((box, i) => ({
    id: box.id ?? "box-" + Date.now() + "-" + i, label: box.label ?? box.className ?? "Detection",
    confidence: box.confidence ?? null, risk: box.risk ?? "HIGH", x: box.x ?? 0, y: box.y ?? 0,
    width: box.width ?? 0, height: box.height ?? 0
  }));
  return Object.entries(result).filter(([,value]) => value === true).map(([key]) => ({
    id: key + "-" + Date.now(), label: labelFor(key), confidence: null, risk: "HIGH"
  }));
}

export default function CameraView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const { detections=[], setDetections, alerts=[], setAlerts, setMlData, setCameraStatus, setSystemStatus, backendOnline } = useAppContext();
  const [cameraActive,setCameraActive]=useState(false), [liveAI,setLiveAI]=useState(false), [capturedImage,setCapturedImage]=useState(null);
  const [cameraError,setCameraError]=useState(""), [activeAlert,setActiveAlert]=useState(null), [soundEnabled,setSoundEnabled]=useState(true), [analyzing,setAnalyzing]=useState(false), [lastResult,setLastResult]=useState(null);

  const processResult = result => {
    setLastResult(result);
    const fire=Boolean(result?.fire), ppe=Boolean(result?.ppe), fatigue=Boolean(result?.fatigue);
    setMlData({fire,ppe,fatigue,riskScore:Math.min(100,(fire?70:0)+(!ppe?40:0)+(fatigue?30:0))});
    const next=toDetections(result); setDetections(next);
    if (!next.length) { setActiveAlert(null); setSystemStatus("SAFE"); return; }
    const item=next[0];
    const alert={id:item.id,title:"AI Safety Alert",message:item.label+" detected by ML backend.",label:item.label,risk:item.risk,confidence:item.confidence,timestamp:new Date().toISOString()};
    setActiveAlert(alert); setAlerts(prev=>[alert,...prev.filter(x=>x.id!==alert.id)]); setSystemStatus("RISK DETECTED");
  };

  const getFrame = () => {
    const video=videoRef.current, canvas=canvasRef.current;
    if (!video || !canvas || !video.videoWidth) throw new Error("Camera is not ready yet.");
    canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    const ctx=canvas.getContext("2d"); if (!ctx) throw new Error("Unable to create camera frame.");
    ctx.drawImage(video,0,0,canvas.width,canvas.height); return canvas.toDataURL("image/jpeg",0.82);
  };

  const startCamera = async () => {
    try { setCameraError(""); setSystemStatus("STARTING CAMERA");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access is not supported.");
      const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false}); streamRef.current=stream;
      if(videoRef.current) videoRef.current.srcObject=stream; setCameraActive(true); setCameraStatus("ACTIVE"); setSystemStatus(backendOnline?"MONITORING":"BACKEND OFFLINE");
    } catch(error) { setCameraError(error.message); setCameraActive(false); setCameraStatus("INACTIVE"); setSystemStatus("CAMERA ERROR"); }
  };

  const stopCamera = () => {
    if(timerRef.current) clearInterval(timerRef.current); timerRef.current=null;
    streamRef.current?.getTracks().forEach(track=>track.stop()); streamRef.current=null;
    if(videoRef.current) videoRef.current.srcObject=null; setLiveAI(false); setCameraActive(false); setCameraStatus("INACTIVE"); setSystemStatus("READY");
  };

  const analyzeCurrentFrame = async () => {
    try { setCameraError(""); setAnalyzing(true); const frame=getFrame(); setCapturedImage(frame); processResult(await analyzeFrame(frame)); }
    catch(error) { setCameraError(error.message); setSystemStatus("AI ERROR"); } finally { setAnalyzing(false); }
  };

  const emitLiveFrame = async () => {
    try { const frame=getFrame(); setCapturedImage(frame); processResult(await analyzeFrame(frame)); }
    catch(error) { setCameraError(error.message); }
  };

  const toggleLiveAI = () => {
    if(liveAI){ if(timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setLiveAI(false); setSystemStatus("MONITORING"); return; }
    if(!cameraActive || !backendOnline) return; emitLiveFrame(); timerRef.current=setInterval(emitLiveFrame,1200); setLiveAI(true); setSystemStatus("LIVE AI");
  };

  useEffect(()=>()=>{ if(timerRef.current) clearInterval(timerRef.current); streamRef.current?.getTracks().forEach(track=>track.stop()); },[]);

  return <section className="sx-page sx-camera-page">
    <header className="sx-page-heading"><div><div className="sx-eyebrow">VISION SYSTEM / CAMERA 01</div><h1>Live <span>Camera</span></h1><p>Visual inspection, AI inference and immediate hazard response.</p></div><div className="sx-camera-state"><span className={cameraActive?"on":""} />{cameraActive?"STREAMING":"STANDBY"}<small>{liveAI?"LIVE AI":"ON DEMAND"}</small></div></header>
    <div className="sx-camera-layout">
      <section className="sx-camera-stage"><div className="sx-stage-header"><span>CAM-01 / VISUAL FEED</span><b>{backendOnline?"AI LINK READY":"AI LINK OFFLINE"}</b></div><div className="sx-video-frame">{capturedImage?<img src={capturedImage} alt="Captured safety frame"/>:<video ref={videoRef} autoPlay playsInline muted />}{!cameraActive&&!capturedImage&&<div className="sx-camera-empty"><div className="sx-camera-glyph">◉</div><b>CAMERA STANDBY</b><span>Initialize the visual sensor to begin monitoring.</span></div>}<div className="sx-corner tl"/><div className="sx-corner tr"/><div className="sx-corner bl"/><div className="sx-corner br"/><div className="sx-scan-beam"/>{capturedImage&&<Overlay detections={detections.filter(d=>d.width>0&&d.height>0)}/>}<div className="sx-feed-hud"><span>REC {cameraActive?"●":"—"}</span><span>AI {backendOnline?(liveAI?"PROCESSING":"READY"):"OFFLINE"}</span><span>DET {String(detections.length).padStart(2,"0")}</span></div></div><canvas ref={canvasRef} hidden/><div className="sx-camera-controls">{!cameraActive?<button className="sx-primary-action" onClick={startCamera}>START CAMERA <span>↗</span></button>:<button onClick={stopCamera}>STOP CAMERA</button>}<button onClick={analyzeCurrentFrame} disabled={!cameraActive||analyzing||!backendOnline}>{analyzing?"ANALYZING…":"ANALYZE FRAME"}</button><button className={liveAI?"sx-active-action":""} onClick={toggleLiveAI} disabled={!cameraActive||!backendOnline}>{liveAI?"STOP LIVE AI":"START LIVE AI"}</button><button onClick={()=>{setCapturedImage(null);setDetections([]);setActiveAlert(null);setLastResult(null);}}>CLEAR</button><button onClick={()=>setSoundEnabled(v=>!v)}>SOUND {soundEnabled?"ON":"OFF"}</button></div>{cameraError&&<div className="sx-error-strip"><span>!</span>{cameraError}</div>}</section>
      <aside className="sx-camera-sidebar"><div className="sx-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">THREAT / 102</span><h2>Detection feed</h2></div><span className="sx-count-badge">{detections.length}</span></div>{detections.length?<div className="sx-detection-list">{detections.map((d,i)=><div className="sx-detection-row" key={d.id||i}><span className="sx-detection-icon">!</span><div><b>{d.label}</b><small>{d.confidence==null?"MODEL SIGNAL":d.confidence+"% CONFIDENCE"}</small></div><strong className={String(d.risk).toLowerCase()}>{d.risk}</strong></div>)}</div>:<div className="sx-empty-state"><span>◎</span><b>NO ACTIVE DETECTIONS</b><small>AI findings appear here after analysis.</small></div>}</div><div className="sx-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">RISK / 103</span><h2>Risk assessment</h2></div></div>{detections.length?<RiskMeter detections={detections}/>:<div className="sx-risk-empty"><div>00</div><span>WAITING FOR SENSOR DATA</span></div>}</div>{activeAlert&&<AlertBox alert={activeAlert} onClose={()=>setActiveAlert(null)}/>} {activeAlert&&<SoundAlert enabled={soundEnabled} risk={activeAlert.risk}/>}</aside>
    </div>
    <div className="sx-camera-footer"><div><span>CAPTURED</span><b>{capturedImage?"YES":"NO"}</b></div><div><span>ALERTS</span><b>{String(alerts.length).padStart(2,"0")}</b></div><div><span>PIPELINE</span><b>{lastResult?"RESULT RECEIVED":"IDLE"}</b></div><div><span>MODE</span><b>{liveAI?"CONTINUOUS":"ON DEMAND"}</b></div></div>
  </section>;
}