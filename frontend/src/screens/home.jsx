
import { useState } from "react";
import { useAppContext } from "../context/appcontext";

function Home() {
  const [showInfo, setShowInfo] = useState(false);

  const {
    detections = [],
    alerts = [],
    cameraStatus = "INACTIVE",
    systemStatus = "READY",
  } = useAppContext();

  const highRiskCount = detections.filter((detection) => {
    const risk = String(detection.risk || "").toUpperCase();
    return risk === "HIGH" || risk === "CRITICAL";
  }).length;

  const getStatusColor = (status) => {
    const normalizedStatus = String(status).toUpperCase();

    if (
      normalizedStatus === "ACTIVE" ||
      normalizedStatus === "MONITORING" ||
      normalizedStatus === "READY" ||
      normalizedStatus === "FRAME_CAPTURED"
    ) {
      return "#86efac";
    }

    if (
      normalizedStatus === "ERROR" ||
      normalizedStatus === "FAILED"
    ) {
      return "#f87171";
    }

    if (
      normalizedStatus === "STARTING" ||
      normalizedStatus === "STOPPED"
    ) {
      return "#facc15";
    }

    return "#cbd5e1";
  };

  const cardStyle = {
    padding: "22px",
    border: "1px solid #334155",
    borderRadius: "14px",
    backgroundColor: "#1e293b",
    textAlign: "left",
    boxSizing: "border-box",
  };

  const smallLabelStyle = {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };

  return (
    <div
      className="suraksha-screen home-screen"
      style={{
        minHeight: "100vh",
        padding: "30px 20px 50px",
        boxSizing: "border-box",
        color: "#ffffff",
        backgroundColor: "#0f172a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1150px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "35px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#67e8f9",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
              }}
            >
              INDUSTRIAL SAFETY PLATFORM
            </p>

            <h1
              style={{
                margin: 0,
                color: "#f8fafc",
                fontSize: "clamp(30px, 5vw, 48px)",
                lineHeight: "1.15",
              }}
            >
              Safety AI
            </h1>

            <p
              style={{
                maxWidth: "650px",
                margin: "14px 0 0",
                color: "#cbd5e1",
                fontSize: "15px",
                lineHeight: "1.7",
              }}
            >
              An industrial safety monitoring interface for observing
              workplace conditions, reviewing detected risks, and supporting
              safer operational decisions.
            </p>
          </div>

          <div
            style={{
              padding: "10px 14px",
              border: "1px solid #334155",
              borderRadius: "10px",
              backgroundColor: "#111827",
              textAlign: "right",
            }}
          >
            <p style={smallLabelStyle}>System Status</p>

            <p
              style={{
                margin: "6px 0 0",
                color: getStatusColor(systemStatus),
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              ● {String(systemStatus).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Overview */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div style={cardStyle}>
            <p style={smallLabelStyle}>Detected Objects</p>

            <h2
              style={{
                margin: "12px 0 5px",
                color: "#67e8f9",
                fontSize: "32px",
              }}
            >
              {detections.length}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                fontSize: "13px",
              }}
            >
              Current detection records
            </p>
          </div>

          <div style={cardStyle}>
            <p style={smallLabelStyle}>Active Alerts</p>

            <h2
              style={{
                margin: "12px 0 5px",
                color: alerts.length > 0 ? "#facc15" : "#86efac",
                fontSize: "32px",
              }}
            >
              {alerts.length}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                fontSize: "13px",
              }}
            >
              Recorded safety alerts
            </p>
          </div>

          <div style={cardStyle}>
            <p style={smallLabelStyle}>High-Risk Records</p>

            <h2
              style={{
                margin: "12px 0 5px",
                color: highRiskCount > 0 ? "#f87171" : "#86efac",
                fontSize: "32px",
              }}
            >
              {highRiskCount}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                fontSize: "13px",
              }}
            >
              High or critical detections
            </p>
          </div>

          <div style={cardStyle}>
            <p style={smallLabelStyle}>Camera Status</p>

            <h2
              style={{
                margin: "12px 0 5px",
                color: getStatusColor(cameraStatus),
                fontSize: "22px",
                wordBreak: "break-word",
              }}
            >
              {String(cameraStatus).toUpperCase()}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                fontSize: "13px",
              }}
            >
              Camera monitoring state
            </p>
          </div>
        </section>

        {/* Main information panel */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <span style={{ fontSize: "24px" }}>◉</span>

              <h2
                style={{
                  margin: 0,
                  color: "#67e8f9",
                  fontSize: "20px",
                }}
              >
                Camera Monitoring
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                lineHeight: "1.7",
                fontSize: "14px",
              }}
            >
              Capture safety frames and review available detection records
              through the camera monitoring interface.
            </p>

            <div
              style={{
                marginTop: "18px",
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: getStatusColor(cameraStatus),
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              ● {String(cameraStatus).toUpperCase()}
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <span style={{ fontSize: "24px" }}>⚠</span>

              <h2
                style={{
                  margin: 0,
                  color: "#facc15",
                  fontSize: "20px",
                }}
              >
                Safety Alerts
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                lineHeight: "1.7",
                fontSize: "14px",
              }}
            >
              Review detected safety violations and identify records that
              require additional attention.
            </p>

            <div
              style={{
                marginTop: "18px",
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: alerts.length > 0 ? "#facc15" : "#86efac",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {alerts.length > 0
                ? `${alerts.length} ALERT(S) RECORDED`
                : "NO ACTIVE ALERTS"}
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <span style={{ fontSize: "24px" }}>▣</span>

              <h2
                style={{
                  margin: 0,
                  color: "#86efac",
                  fontSize: "20px",
                }}
              >
                Risk Analysis
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                lineHeight: "1.7",
                fontSize: "14px",
              }}
            >
              Inspect detection records and review risk classifications
              through the dashboard and reports sections.
            </p>

            <div
              style={{
                marginTop: "18px",
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: "#86efac",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {detections.length > 0
                ? `${detections.length} RECORD(S) AVAILABLE`
                : "NO DETECTION DATA"}
            </div>
          </div>
        </section>

        {/* About Platform */}
        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            backgroundColor: "#1e293b",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            aria-expanded={showInfo}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              padding: "20px",
              border: "none",
              color: "#f8fafc",
              backgroundColor: "transparent",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span>
              <strong
                style={{
                  display: "block",
                  color: "#67e8f9",
                  fontSize: "18px",
                  marginBottom: "5px",
                }}
              >
                About the Platform
              </strong>

              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                View the current platform capabilities
              </span>
            </span>

            <span
              style={{
                color: "#67e8f9",
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              {showInfo ? "−" : "+"}
            </span>
          </button>

          {showInfo && (
            <div
              style={{
                padding: "0 20px 22px",
                borderTop: "1px solid #334155",
              }}
            >
              <h3
                style={{
                  margin: "20px 0 12px",
                  color: "#f8fafc",
                  fontSize: "16px",
                }}
              >
                Current Features
              </h3>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#cbd5e1",
                  lineHeight: "1.9",
                  fontSize: "14px",
                }}
              >
                <li>Camera-based safety frame monitoring</li>
                <li>Detection overlay and risk classification</li>
                <li>Safety alert records</li>
                <li>Risk dashboard and report review</li>
                <li>Scenario-based safety simulation</li>
                <li>Application context for shared monitoring data</li>
              </ul>

              <div
                style={{
                  marginTop: "18px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#0f172a",
                  color: "#94a3b8",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                Current detection records may use application-level or mock
                data. A connected production AI backend should be verified
                separately before treating results as live AI predictions.
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <p
          style={{
            margin: "30px 0 0",
            color: "#64748b",
            textAlign: "center",
            fontSize: "12px",
          }}
        >
          Safety AI • Industrial Safety Monitoring Interface
        </p>
      </div>
    </div>
  );
}

export default Home;