import {
  useEffect,
  useRef,
  useState,
} from "react";

import Overlay from "../components/camera/overlay";

import AlertBox from "../components/alerts/alertbox";
import SoundAlert from "../components/alerts/soundalert";
import RiskMeter from "../components/ui/riskmeter";

import {
  analyzeFrame,
} from "../services/api";

import {
  useAppContext,
} from "../context/appcontext";


// ------------------------------------
// Convert ML key to readable label
// ------------------------------------

function violationLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


// ------------------------------------
// Convert ML response → frontend detections
// ------------------------------------

function resultToDetections(result) {
  if (
    !result ||
    typeof result !== "object"
  ) {
    return [];
  }

  const detections = [];

  // Current ML backend:
  //
  // {
  //   fire: false,
  //   ppe: false,
  //   fatigue: false
  // }

  Object.entries(result).forEach(
    ([key, value]) => {
      if (value === true) {
        detections.push({
          id: `${key}-${Date.now()}`,

          label: violationLabel(key),

          confidence: null,

          risk: "HIGH",
        });
      }
    }
  );


  // --------------------------------
  // Future YOLO/model response
  // --------------------------------

  if (Array.isArray(result.boxes)) {
    return result.boxes.map(
      (box, index) => ({
        id:
          box.id ??
          `box-${Date.now()}-${index}`,

        label:
          box.label ??
          box.className ??
          "Detection",

        confidence:
          box.confidence ?? null,

        risk:
          box.risk ?? "HIGH",

        x: box.x ?? 0,

        y: box.y ?? 0,

        width:
          box.width ?? 0,

        height:
          box.height ?? 0,
      })
    );
  }

  return detections;
}


function CameraView() {
  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const liveTimerRef =
    useRef(null);


  const {
    detections,
    setDetections,

    alerts,
    setAlerts,
    setMlData,

    setCameraStatus,
    setSystemStatus,

    backendOnline,
  } = useAppContext();


  const [
    cameraActive,
    setCameraActive,
  ] = useState(false);

  const [
    liveAI,
    setLiveAI,
  ] = useState(false);

  const [
    capturedImage,
    setCapturedImage,
  ] = useState(null);

  const [
    cameraError,
    setCameraError,
  ] = useState("");

  const [
    activeAlert,
    setActiveAlert,
  ] = useState(null);

  const [
    soundEnabled,
    setSoundEnabled,
  ] = useState(true);

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    lastResult,
    setLastResult,
  ] = useState(null);


  // ------------------------------------
  // Process ML result
  // ------------------------------------

  const processResult = (
    result
  ) => {
    setLastResult(result);

    const fire = Boolean(result?.fire);
    const ppe = Boolean(result?.ppe);
    const fatigue = Boolean(result?.fatigue);

    setMlData({
      fire,
      ppe,
      fatigue,
      riskScore: Math.min(
        100,
        (fire ? 70 : 0) +
          (!ppe ? 40 : 0) +
          (fatigue ? 30 : 0)
      ),
    });

    const nextDetections =
      resultToDetections(result);

    setDetections(
      nextDetections
    );


    if (
      nextDetections.length === 0
    ) {
      setActiveAlert(null);

      setSystemStatus(
        "SAFE"
      );

      return;
    }


    const item =
      nextDetections[0];


    const alert = {
      id: item.id,

      title:
        "AI Safety Alert",

      message:
        `${item.label} detected by ML backend.`,

      label:
        item.label,

      risk:
        item.risk,

      confidence:
        item.confidence,

      timestamp:
        new Date().toISOString(),
    };


    setActiveAlert(
      alert
    );


    setAlerts(
      (previous) => [
        alert,

        ...previous.filter(
          (x) =>
            x.id !== alert.id
        ),
      ]
    );


    setSystemStatus(
      "RISK DETECTED"
    );
  };


  // ------------------------------------
  // Capture frame
  // ------------------------------------

  const getFrame = () => {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;


    if (
      !video ||
      !canvas ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      throw new Error(
        "Camera is not ready yet."
      );
    }


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      throw new Error(
        "Unable to create camera frame."
      );
    }


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    return canvas.toDataURL(
      "image/jpeg",
      0.82
    );
  };


  // ------------------------------------
  // Start camera
  // ------------------------------------

  const startCamera =
    async () => {
      try {
        setCameraError("");

        setSystemStatus(
          "STARTING CAMERA"
        );


        if (
          !navigator
            .mediaDevices
            ?.getUserMedia
        ) {
          throw new Error(
            "Camera access is not supported."
          );
        }


        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              video: true,
              audio: false,
            });


        streamRef.current =
          stream;


        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            stream;
        }


        setCameraActive(
          true
        );

        setCameraStatus(
          "ACTIVE"
        );


        setSystemStatus(
          backendOnline
            ? "MONITORING"
            : "BACKEND OFFLINE"
        );


      } catch (error) {
        console.error(
          "Camera error:",
          error
        );

        setCameraError(
          error.message
        );

        setCameraActive(
          false
        );

        setCameraStatus(
          "INACTIVE"
        );

        setSystemStatus(
          "CAMERA ERROR"
        );
      }
    };


  // ------------------------------------
  // Stop camera
  // ------------------------------------

  const stopCamera =
    () => {
      if (
        liveTimerRef.current
      ) {
        clearInterval(
          liveTimerRef.current
        );

        liveTimerRef.current =
          null;
      }


      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current =
          null;
      }


      if (
        videoRef.current
      ) {
        videoRef.current.srcObject =
          null;
      }


      setLiveAI(
        false
      );

      setCameraActive(
        false
      );

      setCameraStatus(
        "INACTIVE"
      );

      setSystemStatus(
        "READY"
      );


    };


  // ------------------------------------
  // Manual ML analysis
  // ------------------------------------

  const analyzeCurrentFrame =
    async () => {
      try {
        setCameraError("");

        setAnalyzing(true);

        const frame =
          getFrame();


        setCapturedImage(
          frame
        );


        const result =
          await analyzeFrame(
            frame
          );


        processResult(
          result
        );

      } catch (error) {
        console.error(
          "ML analysis error:",
          error
        );

        setCameraError(
          error.message
        );

        setSystemStatus(
          "AI ERROR"
        );

      } finally {
        setAnalyzing(
          false
        );
      }
    };


  // ------------------------------------
  // HTTP live frame analysis
  // ------------------------------------

  const emitLiveFrame =
    async () => {
      try {
        const frame = getFrame();
        setCapturedImage(frame);
        const result = await analyzeFrame(frame);
        processResult(result);
      } catch (error) {
        console.error("Live ML frame error:", error);
        setCameraError(error.message);
      }
    };


  // ------------------------------------
  // Start / Stop Live AI
  // ------------------------------------

  const toggleLiveAI =
    () => {
      if (liveAI) {
        if (
          liveTimerRef.current
        ) {
          clearInterval(
            liveTimerRef.current
          );
        }

        liveTimerRef.current =
          null;

        setLiveAI(
          false
        );

        setSystemStatus(
          "MONITORING"
        );

        return;
      }


      if (
        !cameraActive ||
        !backendOnline
      ) {
        return;
      }


      emitLiveFrame();

      liveTimerRef.current =
        setInterval(
          emitLiveFrame,
          1200
        );


      setLiveAI(
        true
      );

      setSystemStatus(
        "LIVE AI"
      );
    };


  // ------------------------------------
  // Cleanup
  // ------------------------------------

  useEffect(() => {

    return (
    <div className="suraksha-screen sx-camera"><div className="sx-page">
      <header className="sx-screen-head"><div><span className="sx-panel-code">VISION / 101</span><h1>Camera command</h1><p>Live visual inspection and AI-assisted hazard detection.</p></div><div className="sx-head-metrics"><div><small>BACKEND</small><b className={backendOnline?"good":"bad"}>{backendOnline?"ONLINE":"OFFLINE"}</b></div><div><small>CAMERA</small><b>{cameraActive?"ACTIVE":"STANDBY"}</b></div><div><small>AI</small><b>{liveAI?"LIVE":"MANUAL"}</b></div></div></header>
      <div className="sx-camera-layout"><section className="sx-camera-stage"><div className="sx-stage-top"><span><i className="sx-live-dot"/> VISUAL FEED</span><span>CAM-01 / {cameraActive?"STREAMING":"NO SIGNAL"}</span></div><div className="sx-video-frame">{capturedImage?<img src={capturedImage} alt="Captured safety frame"/>:<video ref={videoRef} autoPlay playsInline muted />}<div className="sx-corner tl"/><div className="sx-corner tr"/><div className="sx-corner bl"/><div className="sx-corner br"/><div className="sx-scan-beam"/>{!cameraActive&&!capturedImage&&<div className="sx-camera-empty"><div className="sx-camera-glyph">◉</div><strong>CAMERA STANDBY</strong><span>Initialize the visual sensor to begin monitoring.</span></div>}{capturedImage&&<Overlay detections={detections.filter(d=>d.width>0&&d.height>0)}/>}<div className="sx-feed-hud"><span>REC {cameraActive?"●":"—"}</span><span>AI {backendOnline?(liveAI?"PROCESSING":"READY"):"OFFLINE"}</span><span>DET {String(detections.length).padStart(2,"0")}</span></div></div><canvas ref={canvasRef} style={{display:"none"}}/><div className="sx-camera-controls">{!cameraActive?<button className="sx-primary-action" onClick={startCamera}>START CAMERA <span>↗</span></button>:<button onClick={stopCamera}>STOP CAMERA</button>}<button onClick={analyzeCurrentFrame} disabled={!cameraActive||analyzing||!backendOnline}>{analyzing?"ANALYZING…":"ANALYZE FRAME"}</button><button className={liveAI?"sx-active-action":""} onClick={toggleLiveAI} disabled={!cameraActive||!backendOnline}>{liveAI?"STOP LIVE AI":"START LIVE AI"}</button><button onClick={()=>{setCapturedImage(null);setDetections([]);setActiveAlert(null);setLastResult(null);}}>CLEAR</button><button onClick={()=>setSoundEnabled(v=>!v)}>SOUND {soundEnabled?"ON":"OFF"}</button></div>{cameraError&&<div className="sx-error-strip"><span>!</span>{cameraError}</div>}</section>
      <aside className="sx-camera-sidebar"><div className="sx-panel sx-threat-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">THREAT / 102</span><h2>Detection feed</h2></div><span className="sx-count-badge">{detections.length}</span></div>{detections.length?<div className="sx-detection-list">{detections.map((d,i)=><div className="sx-detection-row" key={d.id||i}><span className="sx-detection-icon">!</span><div><b>{d.label}</b><small>{d.confidence==null?"MODEL SIGNAL":d.confidence+"% CONFIDENCE"}</small></div><strong className={d.risk==="CRITICAL"?"critical":d.risk==="HIGH"?"high":"medium"}>{d.risk}</strong></div>)}</div>:<div className="sx-empty-state"><span>◎</span><b>NO ACTIVE DETECTIONS</b><small>AI findings will appear here when a frame is analyzed.</small></div>}</div><div className="sx-panel sx-risk-panel"><div className="sx-panel-head"><div><span className="sx-panel-code">RISK / 103</span><h2>Risk assessment</h2></div></div>{detections.length>0&&<RiskMeter detections={detections}/>} {!detections.length&&<div className="sx-risk-empty"><div>00</div><span>WAITING FOR SENSOR DATA</span></div>}</div>{activeAlert&&<AlertBox alert={activeAlert} onClose={()=>setActiveAlert(null)}/>} {activeAlert&&<SoundAlert enabled={soundEnabled} risk={activeAlert.risk}/>}</aside></div>
      <section className="sx-camera-footer"><div><span>CAPTURED</span><b>{capturedImage?"YES":"NO"}</b></div><div><span>ALERTS</span><b>{String(alerts.length).padStart(2,"0")}</b></div><div><span>PIPELINE</span><b>{lastResult?"RESULT RECEIVED":"IDLE"}</b></div><div><span>MODE</span><b>{liveAI?"CONTINUOUS":"ON DEMAND"}</b></div></section>
    </div></div>
  );
}

export default CameraView;