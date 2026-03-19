import { useState } from "react";
import { db } from "../config/firestore.js";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import InfoOverlay from "./InfoOverlay.jsx";

export default function IntegrityPledge({ onNext, onBack, PID }) {
  const [pledged, setPledged] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckboxChange = () => setPledged((prev) => !prev);

  const handleSubmit = async () => {
    try {
      if (PID) {
        const userRef = doc(db, "user", PID);
        await updateDoc(userRef, {
          integrityPledged: true,
          integrityTimestamp: serverTimestamp(),
        });

        console.log("Integrity pledge recorded for UID:", PID);
      } else {
        console.log("No PID found.");
      }

      setShowOverlay(true);
    } catch (err) {
      console.error("Error saving integrity pledge:", err);
      setError("Failed to record pledge. Please try again.");
    }
  };

  if (showOverlay) {
    return (
      <InfoOverlay
        title="Comprehension Check"
        message={"Now, you will play 2 comprehension check problems.\n\nPlease carefully read the instructions and make your choices."}
        onOk={onNext}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 20,
      }}
    >
      <h2 style={{ textAlign: "center", color: "#0064a4" }}>Integrity Pledge</h2>

      <div className="no-select" style={{ textAlign: "left" }}>
        <p>
          By checking the box below, you pledge that you have read and understood
          the instructions completely, and that you will participate in this study
          to the best of your abilities and answer all questions honestly and
          thoroughly.
        </p>

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

        {error && (
          <p style={{ color: "red", marginTop: 10 }}>{error}</p>
        )}

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
