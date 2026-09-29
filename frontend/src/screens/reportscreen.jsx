
import { useState } from "react";

import { useAppContext } from "../context/appcontext";

function ReportScreen() {
  const [reportGenerated, setReportGenerated] = useState(false);

  const {
    detections,
    alerts,
    cameraStatus,
    systemStatus,
  } = useAppContext();

  const inspectionDate = new Date().toLocaleDateString();
  const inspectionTime = new Date().toLocaleTimeString();

  const highRiskEvents = detections.filter(
    (detection) =>
      detection.risk === "HIGH" ||
      detection.risk === "CRITICAL"
  );

  const mediumRiskEvents = detections.filter(
    (detection) => detection.risk === "MEDIUM"
  );

  const lowRiskEvents = detections.filter(
    (detection) => detection.risk === "LOW"
  );

  const getOverallRisk = () => {
    if (detections.length === 0) {
      return "NO DATA";
    }

    if (
      detections.some(
        (detection) => detection.risk === "CRITICAL"
      )
    ) {
      return "CRITICAL";
    }

    if (
      detections.some(
        (detection) => detection.risk === "HIGH"
      )
    ) {
      return "HIGH";
    }

    if (
      detections.some(
        (detection) => detection.risk === "MEDIUM"
      )
    ) {
      return "MEDIUM";
    }

    return "LOW";
  };

  const getRecommendation = (risk, label) => {
    if (risk === "CRITICAL") {
      return `Stop the affected operation and immediately investigate ${label}.`;
    }

    if (risk === "HIGH") {
      return `Ensure corrective safety action is taken for ${label}.`;
    }

    if (risk === "MEDIUM") {
      return `Review the detected ${label} condition and take preventive action.`;
    }

    return `Continue monitoring the ${label} detection.`;
  };

  const reportData = {
    reportId: `SAFETY-REPORT-${Date.now()}`,
    inspectionDate,
    inspectionTime,
    location: "Industrial Safety Monitoring Zone",
    totalDetections: detections.length,
    highRiskEvents: highRiskEvents.length,
    mediumRiskEvents: mediumRiskEvents.length,
    lowRiskEvents: lowRiskEvents.length,
    overallRisk: getOverallRisk(),
    violations: detections.map((detection) => ({
      id: detection.id,
      type: detection.label,
      confidence: detection.confidence,
      risk: detection.risk,
      recommendation: getRecommendation(
        detection.risk,
        detection.label
      ),
    })),
  };

  const generateReport = () => {
    setReportGenerated(true);
  };

  const printReport = () => {
    window.print();
  };

  const getRiskColor = (risk) => {
    if (risk === "CRITICAL" || risk === "HIGH") {
      return "#ef4444";
    }

    if (risk === "MEDIUM") {
      return "#f59e0b";
    }

    if (risk === "LOW") {
      return "#22c55e";
    }

    return "#94a3b8";
  };

  return (
    <div
      className="suraksha-screen report-screen"
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "30px",
        boxSizing: "border-box",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
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
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "32px",
                color: "#f8fafc",
              }}
            >
              Safety Inspection Report
            </h1>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                fontSize: "15px",
              }}
            >
              Industrial Safety Monitoring System
            </p>
          </div>

          <div
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "#1e293b",
              color: "#38bdf8",
              fontWeight: "bold",
            }}
          >
            REPORT
          </div>
        </div>

        {/* Report Information */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <InfoCard
            title="Report ID"
            value={reportData.reportId}
          />

          <InfoCard
            title="Inspection Date"
            value={reportData.inspectionDate}
          />

          <InfoCard
            title="Inspection Time"
            value={reportData.inspectionTime}
          />

          <InfoCard
            title="Location"
            value={reportData.location}
          />

          <InfoCard
            title="Camera Status"
            value={cameraStatus}
          />

          <InfoCard
            title="System Status"
            value={systemStatus}
          />
        </div>

        {/* Overall Risk */}
        <div
          style={{
            padding: "25px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: `1px solid ${getRiskColor(
              reportData.overallRisk
            )}`,
            backgroundColor: "#1e293b",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
              }}
            >
              Overall Safety Risk
            </h2>

            <span
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                backgroundColor: getRiskColor(
                  reportData.overallRisk
                ),
                color: "#ffffff",
                fontWeight: "bold",
              }}
            >
              {reportData.overallRisk}
            </span>
          </div>

          <p
            style={{
              marginBottom: 0,
              color: "#cbd5e1",
            }}
          >
            {detections.length === 0
              ? "No detection data is available. Capture a camera frame to generate safety findings."
              : `${reportData.highRiskEvents} high-risk, ${reportData.mediumRiskEvents} medium-risk, and ${reportData.lowRiskEvents} low-risk detections were recorded.`}
          </p>
        </div>

        {/* Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <StatCard
            title="Total Detections"
            value={reportData.totalDetections}
            color="#38bdf8"
          />

          <StatCard
            title="High Risk"
            value={reportData.highRiskEvents}
            color="#ef4444"
          />

          <StatCard
            title="Medium Risk"
            value={reportData.mediumRiskEvents}
            color="#f59e0b"
          />

          <StatCard
            title="Low Risk"
            value={reportData.lowRiskEvents}
            color="#22c55e"
          />

          <StatCard
            title="Active Alerts"
            value={alerts.length}
            color="#fb7185"
          />
        </div>

        {/* Violation Details */}
        <div
          style={{
            padding: "25px",
            marginBottom: "25px",
            borderRadius: "12px",
            backgroundColor: "#1e293b",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            Detection Details
          </h2>

          {reportData.violations.length === 0 ? (
            <p
              style={{
                color: "#94a3b8",
                marginBottom: 0,
              }}
            >
              No detections available. Capture a frame from
              Camera Monitoring to create a report.
            </p>
          ) : (
            reportData.violations.map((violation) => (
              <div
                key={violation.id}
                style={{
                  marginBottom: "15px",
                  padding: "18px",
                  borderRadius: "8px",
                  border: `1px solid ${getRiskColor(
                    violation.risk
                  )}`,
                  backgroundColor: "#0f172a",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#f8fafc",
                    }}
                  >
                    {violation.type}
                  </h3>

                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "5px",
                      backgroundColor: getRiskColor(
                        violation.risk
                      ),
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {violation.risk}
                  </span>
                </div>

                <p
                  style={{
                    color: "#cbd5e1",
                    marginBottom: "8px",
                  }}
                >
                  Confidence: {violation.confidence}%
                </p>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                  }}
                >
                  Recommendation: {violation.recommendation}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Report Actions */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={generateReport}
            style={buttonStyle("#2563eb")}
          >
            Generate Report
          </button>

          <button
            onClick={printReport}
            style={buttonStyle("#475569")}
          >
            Print Report
          </button>
        </div>

        {/* Report Status */}
        {reportGenerated && (
          <div
            style={{
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#14532d",
              border: "1px solid #22c55e",
              color: "#bbf7d0",
            }}
          >
            Safety report generated successfully.
            <br />
            Report uses the current frontend detection context.
            Backend persistence and export functionality are
            not connected yet.
          </div>
        )}

        {/* Data Status */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#422006",
            border: "1px solid #854d0e",
            color: "#facc15",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          Report data is based on the current frontend
          detection context. Detection results are currently
          mock data and are not yet connected to backend AI.
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "10px",
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: 0,
          color: "#f8fafc",
          fontWeight: "bold",
          fontSize: "15px",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          color: "#cbd5e1",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: 0,
          color,
          fontSize: "30px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function buttonStyle(backgroundColor) {
  return {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor,
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  };
}

export default ReportScreen;