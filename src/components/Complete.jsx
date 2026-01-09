// components/Complete.jsx
import { useState } from "react";
import { db, auth } from "../config/firestore.js";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

export default function Complete({PID}) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(null);

  // Likert scale
  const scale = [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
  ];

  const [responses, setResponses] = useState({
    challenging: "",
    boring: "",
    confident: "",
    effort: "",
    strategy: "",
    seeing_correct_helped: "",
    prior_experience: "",/* 
    ai_accuracy: "",
    ai_helpfulness: "", */
    strategy_text: "",
    overall_text: "",
  });
const REQUIRED_FIELDS = [
  "challenging",
  "boring",
  "confident",
  "effort",
  "strategy",
  "seeing_correct_helped",
  "prior_experience",
];

  const handleChange = (field, value) => {
    setResponses((prev) => ({ ...prev, [field]: value }));
  };

  const allQuestionsAnswered = () => {
    return REQUIRED_FIELDS.every(
      (field) => responses[field] !== ""
    );
  };


  const submitSurvey = async () => {
    if (!allQuestionsAnswered()) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        alert("User not logged in.");
        return;
      }
      const userRef = doc(db, "user", PID);

      await updateDoc(userRef, {
        survey: {
          timestamp: serverTimestamp(),
          game_experience: {
            challenging: responses.challenging,
            boring: responses.boring,
            confident: responses.confident,
            effort: responses.effort,
            strategy: responses.strategy,
            seeing_correct_helped: responses.seeing_correct_helped,
            prior_experience: responses.prior_experience,
          },/* 
          ai_accuracy: Number(responses.ai_accuracy),
          ai_helpfulness: responses.ai_helpfulness, */
          strategy_free_response: responses.strategy_text.trim(),
          overall_experience: responses.overall_text.trim(),
        },
      });

      const snap = await getDoc(userRef);
      const correctness = snap.data()?.total_correctness ?? 0;
      const computedBonus = correctness * 0.05;
      setBonusAmount(computedBonus.toFixed(2));
      setSubmitted(true);
    } catch (err) {
      console.error("Error saving survey:", err);
      alert("Error saving survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const redirectToProlific = () => {
    const PROLIFIC_REDIRECT =
      "https://app.prolific.co/submissions/complete?cc=UNIQUECODE";
    window.location.replace(PROLIFIC_REDIRECT);
  };

  const sectionStyle = { marginBottom: 30 };
  const questionStyle = { fontWeight: 600 };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2 style={{ fontWeight: 700 }}>Final Survey</h2>
      <p>Please complete the following questions before finishing the study.</p>

      <hr style={{ margin: "20px 0" }} />

      {/* -------------------- GAME EXPERIENCE QUESTIONS -------------------- */}
      <h3>Game Experience</h3>

      <div style={sectionStyle}>
        {[
          { key: "challenging", text: "The game was challenging." },
          { key: "boring", text: "I found the game to be boring." },
          {
            key: "confident",
            text: "I felt confident in my performance throughout the game.",
          },
          {
            key: "effort",
            text: "I put in considerable effort to achieve my performance.",
          },
          {
            key: "strategy",
            text: "I developed a strategy to improve during the game.",
          },
          {
            key: "seeing_correct_helped",
            text: "Seeing the correct solution helped me learn.",
          },
          {
            key: "prior_experience",
            text: "I’ve had prior experience with a similar task.",
          },
        ].map((q) => (
          <div
            key={q.key}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 15,
              gap: 20,
              textAlign: "left",
            }}
          >
            <div style={{ flex: 1, ...questionStyle }}>{q.text}</div>
            <select
              value={responses[q.key]}
              onChange={(e) => handleChange(q.key, e.target.value)}
              style={{ padding: 6, width: 250 }}
            >
              <option value="">Select…</option>
              {scale.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <hr style={{ margin: "25px 0" }} />

      {/* -------------------- AI QUESTIONS -------------------- */}
      

      {/* -------------------- FREE RESPONSE -------------------- */}
      <h3>Free Response</h3>

      <div style={sectionStyle}>
        <div style={questionStyle}>
          Please share the strategy you used (500 characters max)
        </div>
        <textarea
          maxLength={500}
          rows={3}
          value={responses.strategy_text}
          onChange={(e) => handleChange("strategy_text", e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      <div style={sectionStyle}>
        <div style={questionStyle}>
          Overall experience and suggestions for improvement (500 characters max)
        </div>
        <textarea
          maxLength={500}
          rows={3}
          value={responses.overall_text}
          onChange={(e) => handleChange("overall_text", e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      {/* -------------------- SUBMIT BUTTON -------------------- */}
      {!submitted && (
        <button
          onClick={submitSurvey}
          disabled={loading}
          style={{
            padding: "12px 22px",
            background: "#333",
            color: "white",
            borderRadius: 6,
            marginBottom: 20,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      )}

      {/* -------------------- MESSAGE AFTER SUBMISSION -------------------- */}
      {submitted && (
        <div
          style={{
            marginTop: 20,
            marginBottom: 40,
            padding: 15,
            background: "#eef6ff",
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0, fontSize: 16 }}>
            <strong>Thanks for participating!</strong>
          </p>
          <p style={{ marginTop: 6 }}>
            Your bonus payment is <strong>${bonusAmount}</strong> and will be
            distributed shortly.
          </p>
        </div>
      )}

      <hr style={{ margin: "25px 0" }} />

      {/* -------------------- PROLIFIC BUTTON -------------------- */}
      <button
        onClick={redirectToProlific}
        disabled={!submitted}
        style={{
          padding: "14px 26px",
          backgroundColor: submitted ? "#007bff" : "#9fbce8",
          color: "white",
          borderRadius: 8,
          width: "100%",
          maxWidth: 350,
          cursor: submitted ? "pointer" : "not-allowed",
        }}
      >
        Return to Prolific
      </button>

      <div style={{ marginTop: 10, color: "#555", fontSize: 13 }}>
        Once redirected, you cannot return to this study page.
      </div>
    </div>
  );
}

/* <h3>AI Assistant</h3>

      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 15 }}>
          <div style={{ flex: 1, ...questionStyle }}>
            1. Rate the AI assistant's accuracy (0–100).
          </div>
          <input
            type="number"
            min="0"
            max="100"
            value={responses.ai_accuracy}
            onChange={(e) => handleChange("ai_accuracy", e.target.value)}
            style={{ padding: 6, width: 100 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 15 }}>
          <div style={{ flex: 1, ...questionStyle }}>
            2. The AI assistant was helpful during the experiment.
          </div>
          <select
            value={responses.ai_helpfulness}
            onChange={(e) => handleChange("ai_helpfulness", e.target.value)}
            style={{ padding: 6, width: 250 }}
          >
            <option value="">Select…</option>
            {scale.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr style={{ margin: "25px 0" }} /> */