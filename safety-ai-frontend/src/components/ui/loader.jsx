
function Loader({ message = "Processing..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "20px",
        color: "#ffffff",
        backgroundColor: "#1f2937",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          width: "35px",
          height: "35px",
          border: "4px solid #374151",
          borderTop: "4px solid #22d3ee",
          borderRadius: "50%",
          animation: "loaderSpin 1s linear infinite",
        }}
      />

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#d1d5db",
        }}
      >
        {message}
      </p>

      <style>
        {`
          @keyframes loaderSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Loader;