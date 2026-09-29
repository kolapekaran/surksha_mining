
function AlertBox({ alert, onClose }) {
  if (!alert) {
    return null;
  }

  const isHighRisk = alert.risk === "HIGH";
  const isCritical = alert.risk === "CRITICAL";

  const alertColor = isCritical
    ? "#dc2626"
    : isHighRisk
    ? "#ef4444"
    : "#f59e0b";

  return (
    <div
      style={{
        width: "100%",
        padding: "16px",
        marginTop: "15px",
        border: `2px solid ${alertColor}`,
        borderRadius: "10px",
        backgroundColor: "#1f2937",
        color: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <strong
          style={{
            color: alertColor,
            fontSize: "18px",
          }}
        >
          ⚠️ {alert.title || "Safety Alert"}
        </strong>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "6px 10px",
              backgroundColor: "#374151",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        )}
      </div>

      <p style={{ margin: "10px 0 5px" }}>
        {alert.message || alert.label || "Potential safety risk detected."}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#d1d5db",
        }}
      >
        Risk: <strong>{alert.risk || "UNKNOWN"}</strong>
      </p>
    </div>
  );
}

export default AlertBox;