// components/Experiment.jsx
import { useState, useEffect, useRef } from "react";
import { db } from "../config/firestore";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/* ----------------------------------------------
   DEFINE EXPERIMENT IMAGE POOL
------------------------------------------------*/

const ALL_IMAGES = [
  "image_02018.jpg","image_02296.jpg","image_02408.jpg","image_02512.jpg","image_02533.jpg","image_02598.jpg",
  "image_02612.jpg","image_02685.jpg","image_02732.jpg","image_02770.jpg","image_04510.jpg","image_04530.jpg",
  "image_04614.jpg","image_04641.jpg","image_04843.jpg","image_05013.jpg","image_05195.jpg","image_05275.jpg",
  "image_05310.jpg","image_05349.jpg","image_07280.jpg","image_07597.jpg","image_07814.jpg","image_07890.jpg",
  "image_08022.jpg","image_08072.jpg","image_08096.jpg","image_08105.jpg"
];

function pickImages(n) {
  const shuffled = [...ALL_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((img) => `/images/test_images/${img}`);
}

function makeTrial() {
  const images = pickImages(12);
  const correctIndex = Math.floor(Math.random() * 12);
  return { images, correctIndex };
}

/* PHASES */
const PHASE_0 = { name: "Comprehension Check", is_comprehension: true, trials: [makeTrial(), makeTrial(), makeTrial()] };
const PHASE_1 = { name: "Phase 1", trials: [makeTrial(), makeTrial(), makeTrial()] };
const PHASE_2 = { name: "Phase 2", trials: [makeTrial(), { ...makeTrial(), is_attention_check: true }, makeTrial()] };
const PHASE_3 = { name: "Phase 3", trials: [makeTrial(), makeTrial(), makeTrial()] };

const PHASES = [PHASE_0, PHASE_1, PHASE_2, PHASE_3];


/* ---------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------- */

export default function Experiment({ firebase_uid, onFinish }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  const phase = PHASES[phaseIndex];
  const trial = phase.trials[trialIndex];
  const images = trial.images;
  const correctIndex = trial.correctIndex;

  /* ---------------- TIMER CONTROL ---------------- */
  useEffect(() => {
    if (isSubmitted) return; // Pause timer
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [isSubmitted, trialIndex, phaseIndex]);

  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      setIsSubmitted(true);
      setFeedback("Time up! Incorrect");
    }
  }, [timeLeft, isSubmitted]);

  const handleSelect = (i) => setSelectedIndex(i);

  /* --------------- SAVE TRIAL TO FIRESTORE ---------------- */
  const saveTrial = async (correct) => {
    if (!firebase_uid) return;

    const data = {
      trial_id: trialIndex,
      phase: phase.name,
      is_attention_check: trial.is_attention_check || false,
      is_comprehension_check: phase.is_comprehension || false,
      create_time: new Date(),
      end_time: new Date(),
      performance: correct ? 1 : 0,
      best_choice: { index: correctIndex, image: images[correctIndex] },
      user_choice: { index: selectedIndex, image: images[selectedIndex] },
      time_used: 30 - timeLeft,
      timestamp: serverTimestamp(),
    };

    const docRef = doc(
      db,
      "user",
      firebase_uid,
      "experiment",
      phase.name,
      "trial",
      `trial-${trialIndex}`
    );

    await setDoc(docRef, data);
    console.log("Trial saved:", data);
  };

  /* ----------------- SUBMIT ANSWER ----------------- */
  const handleSubmit = async () => {
    if (selectedIndex === null) return;

    clearInterval(timerRef.current);

    const correct = selectedIndex === correctIndex;
    setIsSubmitted(true);
    setFeedback(correct ? "Correct!" : "Incorrect");

    await saveTrial(correct);
  };

  /* ---------------- GO TO NEXT TRIAL / PHASE ------------------ */
  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedIndex(null);
    setFeedback(null);
    setTimeLeft(30);

    if (trialIndex + 1 < phase.trials.length) {
      setTrialIndex((t) => t + 1);
      return;
    }
    if (phaseIndex + 1 < PHASES.length) {
      setPhaseIndex((p) => p + 1);
      setTrialIndex(0);
      return;
    }
    if (onFinish) onFinish();
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>

      {/* HEADER */}
      <h2>
        {phase.name} — Trial {trialIndex + 1} / {phase.trials.length}
      </h2>

      {/* TIMER */}
      <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Time Remaining: {timeLeft}s
      </div>

      {/* INSTRUCTIONS */}
      <div style={{
        background: "#f2f2f2",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10
      }}>
        <b>Instruction:</b> Select the image that matches the target class.
      </div>

      {/* TARGET LABEL (random placeholder text) */}
      <div style={{
        fontSize: 18,
        marginBottom: 10,
        fontWeight: "bold"
      }}>
        Target Class: <span style={{ color: "blue" }}>Example Label</span>
      </div>

      {/* SELECTION DISPLAY */}
      <div style={{ marginBottom: 10 }}>
        <b>Your Selection:</b> {selectedIndex !== null ? selectedIndex : "None"}
      </div>

      {/* IMAGE GRID */}
      <div style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => !isSubmitted && handleSelect(i)}
            style={{
              width: 140,
              height: 140,
              border: selectedIndex === i ? "3px solid blue" : "1px solid #ccc",
              backgroundColor: isSubmitted && i === correctIndex ? "lightgreen" : "white",
              padding: 5,
              cursor: isSubmitted ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={img} style={{ maxWidth: "100%", maxHeight: "100%" }} />
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <div style={{ marginTop: 20 }}>
        {!isSubmitted ? (
          <button onClick={handleSubmit} disabled={selectedIndex === null}>
            Confirm and Submit
          </button>
        ) : (
          <button onClick={handleNext}>Next Problem</button>
        )}
      </div>

      {/* FEEDBACK */}
      {isSubmitted && (
        <p style={{
          marginTop: 20,
          color: feedback === "Correct!" ? "green" : "red",
          fontWeight: "bold"
        }}>
          {feedback} <br />
          {feedback !== "Correct!" && (
            <>Correct Image Index: <b>{correctIndex}</b></>
          )}
        </p>
      )}
    </div>
  );
}
