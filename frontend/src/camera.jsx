

import { useEffect, useRef, useState } from "react";
import { analyzeFrame } from "./services/api";

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const [capturedFrame, setCapturedFrame] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [backendResult, setBackendResult] = useState(null);

  // Detection states
  const [detections, setDetections] = useState([]);

  // Alert states
  const [alerts, setAlerts] = useState([]);
  const [popupAlert, setPopupAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Temporary frontend-only mock detections.
  // These are NOT real AI predictions.
  const mockDetections = [
    {
      id: 1,
      label: "Person",
      confidence: 96,
      risk: "LOW",
      x: 18,
      y: 15,
      width: 28,
      height: 65,
    },
    {
      id: 2,
      label: "No Helmet",
      confidence: 91,
      risk: "HIGH",
      x: 43,
      y: 20,
      width: 20,
      height: 25,
    },
  ];

  // Start camera
  const startCamera = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Camera access is not supported in this browser."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);

      if (err.name === "NotAllowedError") {
        setError("Camera permission denied.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found.");
      } else {
        setError("Unable to access camera.");
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  // Play browser warning sound
  const playAlertSound = () => {
    if (!soundEnabled) {
      return;
    }

    try {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        console.warn(
          "Web Audio API is not supported in this browser."
        );
        return;
      }

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "square";

      oscillator.frequency.setValueAtTime(
        800,
        audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(
        0.15,
        audioContext.currentTime
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      oscillator.stop(audioContext.currentTime + 0.25);

      oscillator.onended = () => {
        audioContext.close();
      };
    } catch (err) {
      console.error("Alert sound error:", err);
    }
  };

  // Generate alerts from detections
  const processAlerts = (newDetections) => {
    const generatedAlerts = newDetections
      .filter((detection) => detection.risk === "HIGH")
      .map((detection) => ({
        id: `${detection.id}-${Date.now()}`,
        title: detection.label,
        message: `High-risk detection: ${detection.label}`,
        risk: detection.risk,
        confidence: detection.confidence,
        timestamp: new Date().toLocaleTimeString(),
      }));

    setAlerts(generatedAlerts);

    if (generatedAlerts.length > 0) {
      setPopupAlert(generatedAlerts[0]);
      playAlertSound();
    } else {
      setPopupAlert(null);
    }
  };

  // Capture frame
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    setError("");

    if (!video || !canvas || video.readyState < 2) {
      setError("Camera is not ready.");
      return null;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setError("Video dimensions are unavailable.");
      return null;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Canvas is not supported.");
      return null;
    }

    context.drawImage(video, 0, 0, width, height);

    const frame = canvas.toDataURL("image/jpeg", 0.8);

    setCapturedFrame(frame);
    setBackendResult(null);

    // Temporary frontend-only detection data
    setDetections(mockDetections);

    // Generate alerts from mock detections
    processAlerts(mockDetections);

    console.log("Frame captured successfully");

    return frame;
  };

  // Send frame to backend
  const sendFrameToBackend = async () => {
    let frame = capturedFrame;

    setError("");

    if (!frame) {
      frame = captureFrame();
    }

    if (!frame) {
      return;
    }

    try {
      setUploading(true);

      const result = await analyzeFrame(frame);

      setBackendResult(result);

      console.log("Backend response:", result);
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.message || "Failed to send frame to backend."
      );
    } finally {
      setUploading(false);
    }
  };

  // Clear captured frame, detections, and alerts
  const clearCapture = () => {
    setCapturedFrame(null);
    setDetections([]);
    setAlerts([]);
    setPopupAlert(null);
    setBackendResult(null);
    setError("");
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Live Camera</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
        style={{
          width: "100%",
          maxWidth: "640px",
          borderRadius: "12px",
          backgroundColor: "#111",
        }}
      />

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      {/* Camera Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        {!cameraActive ? (
          <button onClick={startCamera}>
            Start Camera
          </button>
        ) : (
          <>
            <button onClick={captureFrame}>
              Capture Frame
            </button>

            <button
              onClick={sendFrameToBackend}
              disabled={uploading}
            >
              {uploading ? "Sending..." : "Send to Backend"}
            </button>

            <button onClick={stopCamera}>
              Stop Camera
            </button>
          </>
        )}

        {capturedFrame && (
          <button onClick={clearCapture}>
            Clear Capture
          </button>
        )}
      </div>

      {/* Popup Alert */}
      {popupAlert && (
        <div
          role="alert"
          style={{
            marginTop: "24px",
            padding: "18px",
            borderRadius: "10px",
            backgroundColor: "#7f1d1d",
            color: "#fff",
            border: "2px solid #ef4444",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3 style={{ margin: "0 0 10px" }}>
            🚨 HIGH-RISK ALERT
          </h3>

          <p style={{ margin: "6px 0" }}>
            {popupAlert.message}
          </p>

          <p style={{ margin: "6px 0" }}>
            Confidence: {popupAlert.confidence}%
          </p>

          <p style={{ margin: "6px 0" }}>
            Time: {popupAlert.timestamp}
          </p>

          <button
            onClick={() => setPopupAlert(null)}
            style={{
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            Dismiss Popup
          </button>
        </div>
      )}

      {/* Alert Panel */}
      <div style={{ marginTop: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0 }}>
            Safety Alerts
          </h3>

          <button
            onClick={() =>
              setSoundEnabled((previous) => !previous)
            }
          >
            {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>
        </div>

        {alerts.length === 0 ? (
          <p style={{ color: "green" }}>
            ✅ No active high-risk alerts.
          </p>
        ) : (
          <div style={{ marginTop: "12px" }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: "14px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#fee2e2",
                  color: "#7f1d1d",
                  border: "1px solid #ef4444",
                }}
              >
                <strong>🚨 {alert.title}</strong>

                <p style={{ margin: "6px 0" }}>
                  {alert.message}
                </p>

                <small>
                  Confidence: {alert.confidence}% |{" "}
                  {alert.timestamp}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Captured Frame with AI Overlay */}
      {capturedFrame && (
        <div style={{ marginTop: "28px" }}>
          <h3>Captured Frame with AI Overlay</h3>

          <p
            style={{
              color: "#b45309",
              fontSize: "14px",
            }}
          >
            Demo mode: detections are simulated and are not
            real AI predictions.
          </p>

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "640px",
              overflow: "hidden",
              borderRadius: "12px",
              backgroundColor: "#111",
            }}
          >
            <img
              src={capturedFrame}
              alt="Captured camera frame"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />

            {detections.map((detection) => (
              <div
                key={detection.id}
                style={{
                  position: "absolute",
                  left: `${detection.x}%`,
                  top: `${detection.y}%`,
                  width: `${detection.width}%`,
                  height: `${detection.height}%`,
                  border: `3px solid ${
                    detection.risk === "HIGH"
                      ? "#ef4444"
                      : "#22c55e"
                  }`,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-29px",
                    left: "-3px",
                    padding: "5px 8px",
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor:
                      detection.risk === "HIGH"
                        ? "#ef4444"
                        : "#16a34a",
                    borderRadius: "4px",
                  }}
                >
                  {detection.label}{" "}
                  {detection.confidence}%
                </div>
              </div>
            ))}
          </div>

          {/* Detection Results */}
          <div style={{ marginTop: "16px" }}>
            <h3>Detection Results</h3>

            {detections.length === 0 ? (
              <p>No detections available.</p>
            ) : (
              detections.map((detection) => (
                <div
                  key={detection.id}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    borderRadius: "8px",
                    backgroundColor:
                      detection.risk === "HIGH"
                        ? "#fee2e2"
                        : "#dcfce7",
                    color: "#111",
                  }}
                >
                  <strong>{detection.label}</strong>

                  <br />

                  Confidence: {detection.confidence}%

                  <br />

                  Risk: {detection.risk}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backend Result */}
      {backendResult && (
        <div style={{ marginTop: "24px" }}>
          <h3>Backend Result</h3>

          <pre
            style={{
              padding: "16px",
              overflowX: "auto",
              borderRadius: "8px",
              backgroundColor: "#f3f4f6",
              color: "#111",
            }}
          >
            {JSON.stringify(backendResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p
          role="alert"
          style={{
            marginTop: "16px",
            color: "#dc2626",
            fontWeight: "bold",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Camera;