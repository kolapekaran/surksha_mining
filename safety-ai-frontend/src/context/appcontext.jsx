import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAlerts,
  getCameras,
  healthCheck,
} from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [detections, setDetections] = useState([]);

  const [alerts, setAlerts] = useState([]);

  const [cameraStatus, setCameraStatus] =
    useState("INACTIVE");

  const [systemStatus, setSystemStatus] =
    useState("STARTING");

  const [backendOnline, setBackendOnline] =
    useState(false);

  const [mlData, setMlData] = useState(null);

  // -----------------------------
  // CHECK BACKEND
  // -----------------------------

  useEffect(() => {
    let mounted = true;

    async function checkBackend() {
      try {
        await healthCheck();

        if (!mounted) return;

        setBackendOnline(true);
        setSystemStatus("BACKEND ONLINE");

        const [
          serverAlerts,
          cameras,
        ] = await Promise.all([
          getAlerts(),
          getCameras(),
        ]);

        if (!mounted) return;

        setAlerts(
          Array.isArray(serverAlerts)
            ? serverAlerts
            : []
        );

        if (
          Array.isArray(cameras) &&
          cameras.length > 0
        ) {
          setCameraStatus(
            cameras[0].online
              ? "READY"
              : "OFFLINE"
          );
        }

        setSystemStatus("READY");

        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/ml/health`);
          if (response.ok) setMlData(await response.json());
        } catch (_) {
          setMlData(null);
        }
      } catch (error) {
        console.error(
          "Backend connection error:",
          error
        );

        if (!mounted) return;

        setBackendOnline(false);
        setSystemStatus("BACKEND OFFLINE");
      }
    }

    checkBackend();

    return () => {
      mounted = false;
    };
  }, []);

  // -----------------------------
  // CLEAR DATA
  // -----------------------------

  const clearSafetyData = () => {
    setDetections([]);
    setAlerts([]);
  };

  return (
    <AppContext.Provider
      value={{
        detections,
        setDetections,

        alerts,
        setAlerts,

        cameraStatus,
        setCameraStatus,

        systemStatus,
        setSystemStatus,

        backendOnline,
        mlData,
        setMlData,

        clearSafetyData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used inside AppProvider."
    );
  }

  return context;
}