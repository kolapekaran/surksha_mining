
import BoundingBox from "./boundingbox";

function Overlay({ detections = [] }) {
  return (
    <>
      {detections.map((detection) => (
        <BoundingBox
          key={detection.id}
          detection={detection}
        />
      ))}
    </>
  );
}

export default Overlay;