// components/Complete.jsx
import { useState } from "react";
import { db, auth } from "../config/firestore";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function Complete() {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFeedbackChange = (e) => setFeedback(e.target.value);

  const submitFeedback = async () => {
    try {
      setLoading(true);

      const uid = auth.currentUser?.uid;
      if (!uid) {
        alert("User not logged in.");
        return;
      }

      const userRef = doc(db, "user", uid);
      await updateDoc(userRef, {
        feedback: arrayUnion({
          feedback: feedback.trim(),
          date: new Date().toISOString(),
        }),
      });

      alert("Your feedback has been submitted. Thank you!");
      setFeedback("");
    } catch (err) {
      console.error("Error saving feedback:", err);
      alert("Failed to save feedback.");
    } finally {
      setLoading(false);
    }
  };

  const redirectToProlific = () => {
    const PROLIFIC_REDIRECT =
      "https://app.prolific.co/submissions/complete?cc=UNIQUECODE";
    window.location.replace(PROLIFIC_REDIRECT);
  };

  /* ---------------- STYLES WITH HOVER ---------------- */
  const btnBase = {
    padding: "12px 22px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: 600,
    transition: "all 0.2s ease",
  };

  const feedbackBtnStyle = {
    ...btnBase,
    padding: "10px 18px",
    fontSize: "1rem",
    backgroundColor: "#555",
    color: "#fff",
  };

  const prolificBtnStyle = {
    ...btnBase,
    backgroundColor: "#007bff",
    color: "white",
    width: "100%",
    maxWidth: 350,
    margin: "0 auto",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        lineHeight: 1.6,
      }}
    >
      <h2 style={{ fontWeight: 700, marginBottom: 5 }}>Thank You!</h2>
      <p style={{ fontSize: "1.1rem", marginBottom: 20 }}>
        We greatly appreciate your participation in our study.
      </p>

      <hr style={{ border: "1px solid #0064a0", margin: "25px 0" }} />

      {/* Feedback Section */}
      <h3 style={{ marginBottom: 10 }}>Your Feedback</h3>
      <p style={{ marginTop: -5, marginBottom: 10, fontSize: "0.95rem" }}>
        Your comments help us improve future studies.
      </p>

      <textarea
        rows={4}
        value={feedback}
        onChange={handleFeedbackChange}
        placeholder="Share your thoughts about the study experience..."
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #ccc",
          borderRadius: 6,
          fontSize: "1rem",
        }}
      />

      {/* Submit Feedback Button w/ hover */}
      <button
        onMouseEnter={(e) => {
          if (!loading && feedback.trim() !== "")
            e.currentTarget.style.backgroundColor = "#444";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#555";
        }}
        onClick={submitFeedback}
        disabled={loading || feedback.trim() === ""}
        style={{
          ...feedbackBtnStyle,
          marginTop: 12,
          cursor:
            loading || feedback.trim() === "" ? "not-allowed" : "pointer",
          opacity: loading || feedback.trim() === "" ? 0.6 : 1,
        }}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>

      <hr style={{ border: "1px solid #0064a0", margin: "35px 0" }} />

      {/* Redirect Section */}
      <h3 style={{ marginBottom: 10 }}>Finalize Participation</h3>
      <p style={{ marginTop: -5, marginBottom: 15 }}>
        To receive your compensation, please click the button below to return to
        Prolific.
      </p>
      <p style={{ fontWeight: 600, marginBottom: 20, color: "#b00" }}>
        Once redirected, you will not be able to return to this page.
      </p>

      {/* Return to Prolific Button w/ hover */}
      <button
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#006ae0")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
        onClick={redirectToProlific}
        style={prolificBtnStyle}
      >
        Return to Prolific
      </button>
    </div>
  );
}




