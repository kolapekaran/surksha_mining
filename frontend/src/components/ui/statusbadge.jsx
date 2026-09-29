
function StatusBadge({ status = "UNKNOWN" }) {
  const statusConfig = {
    LIVE: {
      color: "#22c55e",
      backgroundColor: "#14532d",
      label: "LIVE",
    },

    ACTIVE: {
      color: "#22c55e",
      backgroundColor: "#14532d",
      label: "ACTIVE",
    },

    MONITORING: {
      color: "#22c55e",
      backgroundColor: "#14532d",
      label: "MONITORING",
    },

    READY: {
      color: "#38bdf8",
      backgroundColor: "#0c4a6e",
      label: "READY",
    },

    FRAME_CAPTURED: {
      color: "#38bdf8",
      backgroundColor: "#0c4a6e",
      label: "FRAME CAPTURED",
    },

    STARTING: {
      color: "#facc15",
      backgroundColor: "#713f12",
      label: "STARTING",
    },

    WARNING: {
      color: "#facc15",
      backgroundColor: "#713f12",
      label: "WARNING",
    },

    STOPPED: {
      color: "#facc15",
      backgroundColor: "#713f12",
      label: "STOPPED",
    },

    MEDIUM: {
      color: "#facc15",
      backgroundColor: "#713f12",
      label: "MEDIUM RISK",
    },

    HIGH: {
      color: "#f87171",
      backgroundColor: "#7f1d1d",
      label: "HIGH RISK",
    },

    CRITICAL: {
      color: "#ffffff",
      backgroundColor: "#dc2626",
      label: "CRITICAL",
    },

    ERROR: {
      color: "#fecaca",
      backgroundColor: "#7f1d1d",
      label: "ERROR",
    },

    FAILED: {
      color: "#fecaca",
      backgroundColor: "#7f1d1d",
      label: "FAILED",
    },

    SAFE: {
      color: "#22c55e",
      backgroundColor: "#14532d",
      label: "SAFE",
    },

    OFFLINE: {
      color: "#d1d5db",
      backgroundColor: "#374151",
      label: "OFFLINE",
    },

    INACTIVE: {
      color: "#d1d5db",
      backgroundColor: "#374151",
      label: "INACTIVE",
    },

    UNKNOWN: {
      color: "#d1d5db",
      backgroundColor: "#374151",
      label: "UNKNOWN",
    },
  };

  const normalizedStatus = String(status)
    .trim()
    .toUpperCase();

  const currentStatus =
    statusConfig[normalizedStatus] ||
    statusConfig.UNKNOWN;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "5px 10px",
        borderRadius: "999px",
        color: currentStatus.color,
        backgroundColor: currentStatus.backgroundColor,
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          backgroundColor: currentStatus.color,
          flexShrink: 0,
        }}
      />

      {currentStatus.label}
    </span>
  );
}

export default StatusBadge;