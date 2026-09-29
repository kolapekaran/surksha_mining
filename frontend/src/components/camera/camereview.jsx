import { useEffect, useRef, useState } from "react";
import { analyzeFrame } from "../../services/api";
import { useAppContext } from "../../context/appcontext";

function CameraView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const {
    setMlData,
    setCameraStatus,
    setSystemStatus,
  } = useAppContext();

  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      setCameraActive(true);
      setCameraStatus("ACTIVE");
      setSystemStatus("MONITORING");
    } catch (error) {
      console.error("Camera error:", error);
      setSystemStatus("CAMERA ERROR");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraStatus("INACTIVE");
  };

  const detectFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frame = canvas.toDataURL("image/jpeg", 0.82);

    try {
      const data = await analyzeFrame(frame);
      if (!data) return;

      let risk = 0;
      if (data.fire) risk += 70;
      if (!data.ppe) risk += 40;
      if (data.fatigue) risk += 30;

      setMlData({
        fire: Boolean(data.fire),
        ppe: Boolean(data.ppe),
        fatigue: Boolean(data.fatigue),
        riskScore: Math.min(100, risk),
      });
    } catch (error) {
      console.error("ML detection error:", error);
      setSystemStatus("AI ERROR");
    }
  };

  useEffect(() => {
    if (!cameraActive) return undefined;

    const interval = setInterval(detectFrame, 2000);

    return () => clearInterval(interval);
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button onClick={startCamera} disabled={cameraActive}>
        Start
      </button>
      <button onClick={stopCamera} disabled={!cameraActive}>
        Stop
      </button>
    </div>
  );
}

export default CameraView;
