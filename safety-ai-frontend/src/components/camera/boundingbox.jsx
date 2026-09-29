
function BoundingBox({ detection }) {
  const isHighRisk = detection.risk === "HIGH";

  return (
    <div
      style={{
        position: "absolute",
        left: `${detection.x}%`,
        top: `${detection.y}%`,
        width: `${detection.width}%`,
        height: `${detection.height}%`,
        border: `3px solid ${
          isHighRisk ? "#ef4444" : "#22c55e"
        }`,
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-29px",
          left: "-3px",
          padding: "5px 8px",
          whiteSpace: "nowrap",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: isHighRisk
            ? "#ef4444"
            : "#16a34a",
          borderRadius: "4px",
        }}
      >
        {detection.label} {detection.confidence}%
      </div>
    </div>
  );
}

export default BoundingBox;