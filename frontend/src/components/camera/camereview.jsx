import { useEffect, useRef, useState } from "react";
import { detectSafety } from "../../services/api";
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

  // 🔥 START CAMERA
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    streamRef.current = stream;

    setCameraActive(true);
    setCameraStatus("ACTIVE");
    setSystemStatus("MONITORING");
  };

  // 🔥 STOP CAMERA
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setCameraStatus("INACTIVE");
  };

  // 🔥 AUTO DETECTION
  const detectFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || video.videoWidth === 0) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    const data = await detectSafety(blob);
    if (!data) return;

    let risk = 0;
    if (data.fire) risk += 70;
    if (!data.ppe) risk += 40;
    if (data.fatigue) risk += 30;
    if (risk > 100) risk = 100;

    setMlData({
      fire: data.fire,
      ppe: data.ppe,
      fatigue: data.fatigue,
      riskScore: risk,
    });
  };

  // 🔥 AUTO LOOP
  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(() => {
      detectFrame();
    }, 2000);

    return () => clearInterval(interval);
  }, [cameraActive]);

  return (
    <div>
      <video ref={videoRef} autoPlay style={{ width: "100%" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button onClick={startCamera}>Start</button>
      <button onClick={stopCamera}>Stop</button>
    </div>
  );
}

export default CameraView;