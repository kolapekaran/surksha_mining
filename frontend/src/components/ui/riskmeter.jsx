
function RiskMeter({ detections = [], risk = null }) {
  const hasCriticalRisk = detections.some(
    (detection) => detection.risk === "CRITICAL"
  );

  const hasHighRisk = detections.some(
    (detection) => detection.risk === "HIGH"
  );

  const hasMediumRisk = detections.some(
    (detection) => detection.risk === "MEDIUM"
  );

  const calculatedRiskLevel = hasCriticalRisk
    ? "CRITICAL"
    : hasHighRisk
      ? "HIGH"
      : hasMediumRisk
        ? "MEDIUM"
        : detections.length > 0
          ? "LOW"
          : "NO DATA";

  const isNumericRisk =
    typeof risk === "number" && Number.isFinite(risk);

  const normalizedRiskScore = isNumericRisk
    ? Math.max(0, Math.min(100, risk))
    : null;

  const numericRiskLevel = isNumericRisk
    ? normalizedRiskScore >= 85
      ? "CRITICAL"
      : normalizedRiskScore >= 60
        ? "HIGH"
        : normalizedRiskScore >= 30
          ? "MEDIUM"
          : normalizedRiskScore > 0
            ? "LOW"
            : "NO DATA"
    : null;

  const riskLevel = isNumericRisk
    ? numericRiskLevel
    : typeof risk === "string" && risk.trim() !== ""
      ? risk.toUpperCase()
      : calculatedRiskLevel;

  const riskPercentage = isNumericRisk
    ? normalizedRiskScore
    : riskLevel === "CRITICAL"
      ? 100
      : riskLevel === "HIGH"
        ? 75
        : riskLevel === "MEDIUM"
          ? 50
          : riskLevel === "LOW"
            ? 20
            : 0;

  const riskColor =
    riskLevel === "CRITICAL"
      ? "#dc2626"
      : riskLevel === "HIGH"
        ? "#ef4444"
        : riskLevel === "MEDIUM"
          ? "#f59e0b"
          : riskLevel === "LOW"
            ? "#22c55e"
            : "#94a3b8";

  const riskMessage =
    riskLevel === "CRITICAL"
      ? "Critical safety risk detected. Immediate action required."
      : riskLevel === "HIGH"
        ? "High-risk safety violation detected."
        : riskLevel === "MEDIUM"
          ? "Medium-risk safety condition detected. Review the situation."
          : riskLevel === "LOW"
            ? "Low-risk conditions detected."
            : "No detection data is currently available.";

  return (
    <div
      className="sx-risk-meter"
      style={{
        width: "100%",
        marginTop: "15px",
        padding: "16px",
        backgroundColor: "#1f2937",
        borderRadius: "10px",
        color: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <div
          className="sx-risk-fill"
          style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px",
        }}
      >
        <strong>Safety Risk Level</strong>

        <strong style={{ color: riskColor }}>
          {isNumericRisk ? `${normalizedRiskScore}` : riskLevel}
        </strong>
      </div>

      <div
        style={{
          width: "100%",
          height: "16px",
          backgroundColor: "#374151",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${riskPercentage}%`,
            height: "100%",
            backgroundColor: riskColor,
            borderRadius: "10px",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        <span>Risk score</span>
        <span>{Math.round(riskPercentage)}%</span>
      </div>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: "14px",
          color: "#d1d5db",
        }}
      >
        {riskMessage}
      </p>
    </div>
  );
}

export default RiskMeter;