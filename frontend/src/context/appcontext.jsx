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
  const [mlData, setMlData] = useState(null);

  const [alerts, setAlerts] = useState([]);

  const [cameraStatus, setCameraStatus] =
    useState("INACTIVE");

  const [systemStatus, setSystemStatus] =
    useState("STARTING");

  const [backendOnline, setBackendOnline] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkBackend() {
      try {
        await healthCheck();

        if (!mounted) return;

        setBackendOnline(true);
        setSystemStatus("BACKEND ONLINE");

        const [serverAlerts, cameras] = await Promise.all([
          getAlerts(),
          getCameras(),
        ]);

        if (!mounted) return;

        setAlerts(
          Array.isArray(serverAlerts)
            ? serverAlerts
            : []
        );

        if (Array.isArray(cameras) && cameras.length > 0) {
          setCameraStatus(
            cameras[0].online
              ? "READY"
              : "OFFLINE"
          );
        }

        setSystemStatus("READY");
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

  const clearSafetyData = () => {
    setDetections([]);
    setMlData(null);
    setAlerts([]);
  };

  return (
    <AppContext.Provider
      value={{
        detections,
        setDetections,

        mlData,
        setMlData,

        alerts,
        setAlerts,

        cameraStatus,
        setCameraStatus,

        systemStatus,
        setSystemStatus,

        backendOnline,

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
