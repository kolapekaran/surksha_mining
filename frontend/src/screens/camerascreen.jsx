import { useEffect, useRef, useState } from "react";
import Overlay from "../components/camera/overlay";
import AlertBox from "../components/alerts/alertbox";
import SoundAlert from "../components/alerts/soundalert";
import RiskMeter from "../components/ui/riskmeter";
import { analyzeFrame } from "../services/api";
import { useAppContext } from "../context/appcontext";

function labelFor(key) {
  return String(key).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function riskForDetection(domain, label) {
  const value = String(label || "").toLowerCase();
  if (domain === "fire_smoke" || /fire|smoke|flame/.test(value)) return "HIGH";
  if (domain === "ppe" && /no |without|missing|violation|absent/.test(value)) return "HIGH";
  if (domain === "ppe") return "LOW";
  return "MEDIUM";
}

function toDetections(result, frameWidth = 0, frameHeight = 0) {
  if (!result || typeof result !== "object") return [];

  if (Array.isArray(result.detections)) {
    return result.detections.map((item, i) => {
      const box = item.box || {};
      const x1 = Number(box.x1 || 0);
      const y1 = Number(box.y1 || 0);
      const x2 = Number(box.x2 || 0);
      const y2 = Number(box.y2 || 0);
      const width = Math.max(0, x2 - x1);
      const height = Math.max(0, y2 - y1);
      const fw = frameWidth || 1;
      const fh = frameHeight || 1;
      const label = item.label || item.className || item.domain || "Detection";
      return {
        id: item.id || `${item.domain || "det"}-${Date.now()}-${i}`,
        label,
        confidence: item.confidence == null ? null : Math.round(Number(item.confidence) * 100),
        risk: item.risk || riskForDetection(item.domain, label),
        x: (x1 / fw) * 100,
        y: (y1 / fh) * 100,
        width: (width / fw) * 100,
        height: (height / fh) * 100,
        domain: item.domain || "unknown",
      };
    });
  }

  if (Array.isArray(result.boxes)) {
    return result.boxes.map((box, i) => ({
      id: box.id ?? `box-${Date.now()}-${i}`,
      label: box.label ?? box.className ?? "Detection",
      confidence: box.confidence == null ? null : Math.round(Number(box.confidence) * 100),
      risk: box.risk ?? "MEDIUM",
      x: Number(box.x ?? 0),
      y: Number(box.y ?? 0),
      width: Number(box.width ?? 0),
      height: Number(box.height ?? 0),
    }));
  }

  return Object.entries(result)
    .filter(([, value]) => value === true)
    .map(([key]) => ({
      id: key + "-" + Date.now(),
      label: labelFor(key),
      confidence: null,
      risk: key === "fire" ? "HIGH" : key === "ppe" ? "LOW" : "MEDIUM",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }));
}

export default function CameraView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const liveBusyRef = useRef(false);

  const {
    detections = [],
    setDetections,
    alerts = [],
    setAlerts,
    setMlData,
    setCameraStatus,
    setSystemStatus,
    backendOnline,
  } = useAppContext();

  const [cameraActive, setCameraActive] = useState(false);
  const [liveAI, setLiveAI] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [activeAlert, setActiveAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const processResult = (result, frameWidth, frameHeight) => {
    setLastResult(result);

    const fire = Boolean(result?.fire);
    const ppe = Boolean(result?.ppe);
    const fatigue = Boolean(result?.fatigue);
    const next = toDetections(result, frameWidth, frameHeight);

    const riskScore = Math.min(
      100,
      (fire ? 70 : 0) + (!ppe ? 40 : 0) + (fatigue ? 30 : 0)
    );

    setMlData({ fire, ppe, fatigue, riskScore });
    setDetections(next);

    if (!next.length) {
      setActiveAlert(null);
      setSystemStatus("SAFE");
      return;
    }

    const highRisk = next.filter(d => ["HIGH", "CRITICAL"].includes(d.risk));
    const item = highRisk[0] || next[0];
    const alert = {
      id: item.id,
      title: "AI Safety Alert",
      message: `${item.label} detected by ML backend.`,
      label: item.label,
      risk: item.risk,
      confidence: item.confidence,
      timestamp: new Date().toISOString(),
    };

    if (["HIGH", "CRITICAL"].includes(item.risk)) {
      setActiveAlert(alert);
      setAlerts(prev => [alert, ...prev.filter(x => x.id !== alert.id)].slice(0, 25));
      setSystemStatus("RISK DETECTED");
    } else {
      setActiveAlert(null);
      setSystemStatus("MONITORING");
    }
  };

  const getFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      throw new Error("Camera is not ready yet. Wait for the video feed to start.");
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new Error("Camera video dimensions are unavailable.");
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to create camera frame.");

    ctx.drawImage(video, 0, 0, width, height);
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.82),
      width,
      height,
    };
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      setSystemStatus("STARTING CAMERA");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is unavailable. Open the app on localhost/127.0.0.1 and allow camera permission.");
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error("Camera video element is not available.");
      }

      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      await videoRef.current.play();

      setCapturedImage(null);
      setCameraActive(true);
      setCameraStatus("ACTIVE");
      setSystemStatus(backendOnline ? "MONITORING" : "BACKEND OFFLINE");
    } catch (error) {
      console.error("Camera start error:", error);
      const name = error?.name;
      const message =
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access for localhost in browser settings and try again."
          : name === "NotFoundError"
            ? "No camera device was found."
            : name === "NotReadableError"
              ? "The camera is already being used by another application."
              : name === "OverconstrainedError"
                ? "The requested camera mode is unavailable. Try the default camera."
                : error?.message || "Unable to access the camera.";

      setCameraError(message);
      setCameraActive(false);
      setCameraStatus("INACTIVE");
      setSystemStatus("CAMERA ERROR");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLiveAI(false);
    liveBusyRef.current = false;
    setCameraActive(false);
    setCameraStatus("INACTIVE");
    setSystemStatus("READY");
  };

  const analyzeCurrentFrame = async () => {
    try {
      setCameraError("");
      setAnalyzing(true);
      const frame = getFrame();
      setCapturedImage(frame.dataUrl);
      const result = await analyzeFrame(frame.dataUrl);
      processResult(result, frame.width, frame.height);
    } catch (error) {
      console.error("Frame analysis error:", error);
      setCameraError(error?.message || "Frame analysis failed.");
      setSystemStatus("AI ERROR");
    } finally {
      setAnalyzing(false);
    }
  };

  const emitLiveFrame = async () => {
    if (liveBusyRef.current || !cameraActive || !backendOnline) return;
    liveBusyRef.current = true;

    try {
      const frame = getFrame();
      const result = await analyzeFrame(frame.dataUrl);
      processResult(result, frame.width, frame.height);
    } catch (error) {
      console.error("Live AI frame error:", error);
      setCameraError(error?.message || "Live AI analysis failed.");
    } finally {
      liveBusyRef.current = false;
    }
  };

  const toggleLiveAI = () => {
    if (liveAI) {
      setLiveAI(false);
      liveBusyRef.current = false;
      setSystemStatus("MONITORING");
      return;
    }

    if (!cameraActive) {
      setCameraError("Start the camera before enabling Live AI.");
      return;
    }

    if (!backendOnline) {
      setCameraError("Backend is offline. Start FastAPI before enabling Live AI.");
      return;
    }

    setLiveAI(true);
    setSystemStatus("LIVE AI");
    emitLiveFrame();
  };

  useEffect(() => {
    if (!liveAI) return undefined;
    const timer = window.setInterval(emitLiveFrame, 1500);
    return () => window.clearInterval(timer);
  }, [liveAI, cameraActive, backendOnline]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <section className="sx-page sx-camera-page">
      <header className="sx-page-heading">
        <div>
          <div className="sx-eyebrow">VISION SYSTEM / CAMERA 01</div>
          <h1>Live <span>Camera</span></h1>
          <p>Visual inspection, AI inference and immediate hazard response.</p>
        </div>
        <div className="sx-camera-state">
          <span className={cameraActive ? "on" : ""} />
          {cameraActive ? "STREAMING" : "STANDBY"}
          <small>{liveAI ? "LIVE AI" : "ON DEMAND"}</small>
        </div>
      </header>

      <div className="sx-camera-layout">
        <section className="sx-camera-stage">
          <div className="sx-stage-header">
            <span>CAM-01 / VISUAL FEED</span>
            <b>{backendOnline ? "AI LINK READY" : "AI LINK OFFLINE"}</b>
          </div>

          <div className="sx-video-frame">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted />
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured safety frame" />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted />
            )}

            {!cameraActive && !capturedImage && (
              <div className="sx-camera-empty">
                <div className="sx-camera-glyph">◉</div>
                <b>CAMERA STANDBY</b>
                <span>Initialize the visual sensor to begin monitoring.</span>
              </div>
            )}

            <div className="sx-corner tl" />
            <div className="sx-corner tr" />
            <div className="sx-corner bl" />
            <div className="sx-corner br" />
            <div className="sx-scan-beam" />

            {cameraActive && (
              <Overlay detections={detections.filter(d => d.width > 0 && d.height > 0)} />
            )}

            <div className="sx-feed-hud">
              <span>REC {cameraActive ? "●" : "—"}</span>
              <span>AI {backendOnline ? liveAI ? "PROCESSING" : "READY" : "OFFLINE"}</span>
              <span>DET {String(detections.length).padStart(2, "0")}</span>
            </div>
          </div>

          <canvas ref={canvasRef} hidden />

          <div className="sx-camera-controls">
            {!cameraActive ? (
              <button className="sx-primary-action" onClick={startCamera}>
                START CAMERA <span>↗</span>
              </button>
            ) : (
              <button onClick={stopCamera}>STOP CAMERA</button>
            )}

            <button onClick={analyzeCurrentFrame} disabled={!cameraActive || analyzing || !backendOnline}>
              {analyzing ? "ANALYZING…" : "ANALYZE FRAME"}
            </button>

            <button className={liveAI ? "sx-active-action" : ""} onClick={toggleLiveAI} disabled={!cameraActive || !backendOnline}>
              {liveAI ? "STOP LIVE AI" : "START LIVE AI"}
            </button>

            <button onClick={() => {
              setCapturedImage(null);
              setDetections([]);
              setActiveAlert(null);
              setLastResult(null);
              setCameraError("");
              setSystemStatus(cameraActive ? "MONITORING" : "READY");
            }}>
              CLEAR
            </button>

            <button onClick={() => setSoundEnabled(v => !v)}>
              SOUND {soundEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {cameraError && (
            <div className="sx-error-strip">
              <span>!</span>{cameraError}
            </div>
          )}
        </section>

        <aside className="sx-camera-sidebar">
          <div className="sx-panel">
            <div className="sx-panel-head">
              <div><span className="sx-panel-code">THREAT / 102</span><h2>Detection feed</h2></div>
              <span className="sx-count-badge">{detections.length}</span>
            </div>

            {detections.length ? (
              <div className="sx-detection-list">
                {detections.map((d, i) => (
                  <div className="sx-detection-row" key={d.id || i}>
                    <span className="sx-detection-icon">!</span>
                    <div><b>{d.label}</b><small>{d.confidence == null ? "MODEL SIGNAL" : d.confidence + "% CONFIDENCE"}</small></div>
                    <strong className={String(d.risk).toLowerCase()}>{d.risk}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sx-empty-state"><span>◎</span><b>NO ACTIVE DETECTIONS</b><small>AI findings appear here after analysis.</small></div>
            )}
          </div>

          <div className="sx-panel">
            <div className="sx-panel-head">
              <div><span className="sx-panel-code">RISK / 103</span><h2>Risk assessment</h2></div>
            </div>
            {detections.length ? <RiskMeter detections={detections} /> : <div className="sx-risk-empty"><div>00</div><span>WAITING FOR SENSOR DATA</span></div>}
          </div>

          {activeAlert && <AlertBox alert={activeAlert} onClose={() => setActiveAlert(null)} />}
          {activeAlert && <SoundAlert enabled={soundEnabled} risk={activeAlert.risk} />}
        </aside>
      </div>

      <div className="sx-camera-footer">
        <div><span>CAPTURED</span><b>{capturedImage ? "YES" : "NO"}</b></div>
        <div><span>ALERTS</span><b>{String(alerts.length).padStart(2, "0")}</b></div>
        <div><span>PIPELINE</span><b>{lastResult ? "RESULT RECEIVED" : "IDLE"}</b></div>
        <div><span>MODE</span><b>{liveAI ? "CONTINUOUS" : "ON DEMAND"}</b></div>
      </div>
    </section>
  );
}
