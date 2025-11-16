// components/IntegrityPledge.jsx
import { useState } from "react";

export default function IntegrityPledge({ onNext, onBack }) {
  const [pledged, setPledged] = useState(false);

  const handleCheckboxChange = () => setPledged((prev) => !prev);

  const handleSubmit = () => {
    if (pledged) {
      console.log("Integrity pledged at:", new Date().toISOString());
      onNext();
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 20,
      }}
    >
      <h2 style={{ textAlign: "center", color: "#0064a4" }}>Integrity Pledge</h2>

      <div style={{ textAlign: "left" }}>
        <p>
          By checking the box below, you pledge that you have read and understood
          the instructions completely, and that you will participate in this study
          to the best of your abilities and answer all questions honestly and
          thoroughly.
        </p>

        {/* Checkbox */}
        <div
          style={{
            border: "2px solid #0064a4",
            background: "rgba(0,0,0,0.02)",
            padding: 12,
            marginTop: 20,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={pledged}
              onChange={handleCheckboxChange}
            />{" "}
            I pledge integrity
          </label>
        </div>

        {/* Buttons */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <button onClick={onBack}>Back</button>
          <button
            onClick={handleSubmit}
            disabled={!pledged}
            style={{
              backgroundColor: pledged ? "#0064a4" : "#888",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "8px 14px",
              cursor: pledged ? "pointer" : "not-allowed",
            }}
          >
            Submit

          </button>
        </div>
      </div>
    </div>
  );
}





