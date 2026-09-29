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

    return () => {

      if (
        liveTimerRef.current
      ) {
        clearInterval(
          liveTimerRef.current
        );
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
      }

    };

  }, []);


  // ------------------------------------
  // UI
  // ------------------------------------

  return (
    <div
      className="suraksha-screen camera-screen"
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "20px auto",
        padding: "20px",
        color: "#fff",
        background: "#111827",
        borderRadius: "12px",
        boxSizing: "border-box",
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <h2>
            AI Safety Camera
          </h2>

          <small
            style={{
              color:
                backendOnline
                  ? "#86efac"
                  : "#fca5a5",
            }}
          >
            ML Backend:{" "}
            {backendOnline
              ? "CONNECTED"
              : "OFFLINE"}
          </small>

        </div>

      </div>


      {cameraError && (
        <div
          style={{
            marginTop: 15,
            padding: 12,
            background: "#991b1b",
            borderRadius: 6,
          }}
        >
          {cameraError}
        </div>
      )}


      <div
        style={{
          position: "relative",
          marginTop: 15,
          overflow: "hidden",
          borderRadius: 10,
          background: "#000",
        }}
      >

        {capturedImage ? (

          <img
            src={capturedImage}
            alt="Captured safety frame"
            style={{
              display: "block",
              width: "100%",
            }}
          />

        ) : (

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              display: "block",
              width: "100%",
              minHeight: 300,
              objectFit: "cover",
            }}
          />

        )}

        {capturedImage && (
          <Overlay
            detections={detections.filter(
              (d) =>
                d.width > 0 &&
                d.height > 0
            )}
          />
        )}

      </div>


      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />


      {activeAlert && (
        <AlertBox
          alert={activeAlert}
          onClose={() =>
            setActiveAlert(null)
          }
        />
      )}


      {detections.length > 0 && (
        <RiskMeter
          detections={detections}
        />
      )}


      {activeAlert && (
        <div
          style={{
            marginTop: 12,
          }}
        >
          <SoundAlert
            enabled={
              soundEnabled
            }
            risk={
              activeAlert.risk
            }
          />
        </div>
      )}


      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 15,
        }}
      >

        {!cameraActive ? (

          <button
            onClick={
              startCamera
            }
          >
            Start Camera
          </button>

        ) : (

          <button
            onClick={
              stopCamera
            }
          >
            Stop Camera
          </button>

        )}


        <button
          onClick={
            analyzeCurrentFrame
          }
          disabled={
            !cameraActive ||
            analyzing ||
            !backendOnline
          }
        >
          {analyzing
            ? "Analyzing..."
            : "Analyze with ML"}
        </button>


        <button
          onClick={
            toggleLiveAI
          }
          disabled={
            !cameraActive ||
            !backendOnline
          }
        >
          {liveAI
            ? "Stop Live AI"
            : "Start Live AI"}
        </button>


        <button
          onClick={() => {
            setCapturedImage(
              null
            );

            setDetections(
              []
            );

            setActiveAlert(
              null
            );

            setLastResult(
              null
            );
          }}
        >
          Clear
        </button>


        <button
          onClick={() =>
            setSoundEnabled(
              (value) =>
                !value
            )
          }
        >
          {soundEnabled
            ? "Sound On"
            : "Sound Off"}
        </button>

      </div>


      <div
        style={{
          marginTop: 20,
          padding: 12,
          background: "#1e293b",
          borderRadius: 8,
        }}
      >

        <p>
          Detections:{" "}
          {detections.length}
        </p>

        <p>
          Active Alerts:{" "}
          {alerts.length}
        </p>

        {detections.length ===
          0 &&
          lastResult && (
            <p
              style={{
                color: "#86efac",
              }}
            >
              No active safety
              violations detected.
            </p>
          )}

      </div>


      {lastResult && (
        <details
          style={{
            marginTop: 15,
          }}
        >

          <summary>
            Raw ML Response
          </summary>

          <pre
            style={{
              marginTop: 10,
              padding: 12,
              background: "#0f172a",
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(
              lastResult,
              null,
              2
            )}
          </pre>

        </details>
      )}

    </div>
  );
}

export default CameraView;