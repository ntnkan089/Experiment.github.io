import { useState, useEffect, useEffectEvent, useRef } from "react";
import { db } from "../config/firestore.js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const url = import.meta.env.BASE_URL;
const ALL_IMAGES = [
  "image_02018.jpg","image_02296.jpg","image_02408.jpg","image_02512.jpg","image_02533.jpg","image_02598.jpg",
  "image_02612.jpg","image_02685.jpg","image_02732.jpg","image_02770.jpg","image_04510.jpg","image_04530.jpg",
  "image_04614.jpg","image_04641.jpg","image_04843.jpg","image_05013.jpg","image_05195.jpg","image_05275.jpg",
  "image_05310.jpg","image_05349.jpg","image_07280.jpg","image_07597.jpg","image_07814.jpg","image_07890.jpg",
  "image_08022.jpg","image_08072.jpg","image_08096.jpg","image_08105.jpg"
];

function pickImages(n) {
  const shuffled = [...ALL_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map(img => `${url}/images/test_images/${img}`);
}

function makeTrial() {
  const images = pickImages(12);
  const correctIndex = Math.floor(Math.random() * 12);
  return { images, correctIndex };
}

const PHASE_1 = { name: "Phase 1", trials: [makeTrial(), makeTrial(), makeTrial()] };
const PHASE_2 = { name: "Phase 2", trials: [makeTrial(), { ...makeTrial(), is_attention_check: true }, makeTrial()] };
const PHASES = [PHASE_1, PHASE_2];

export default function Experiment({ firebase_uid, onFinish }) {
  // Refs
  const trialStartRef = useRef(0);
  const submitTimeRef = useRef(0);
  const timerRef = useRef(null);
  const onScreenTimeRef = useRef(0);
  const lastVisibleTimeRef = useRef(0);
  const pageVisibleRef = useRef(true);
  const reselectRef = useRef(0);

  // State
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [phaseCorrectCount, setPhaseCorrectCount] = useState(0);
  const [totalCorrectCount, setTotalCorrectCount] = useState(0);

  // Current trial info
  const phase = PHASES[phaseIndex];
  const trial = phase.trials[trialIndex];
  const images = trial.images;
  const correctIndex = trial.correctIndex;

  const columns = 4; // number of columns in the grid
  //const rows = Math.ceil(images.length / columns);

  const getRowCol = (i) => ({ row: Math.floor(i / columns), col: i % columns });

  // Reset trial
  useEffect(() => {
    trialStartRef.current = Date.now();
    submitTimeRef.current = 0;
    onScreenTimeRef.current = 0;
    lastVisibleTimeRef.current = Date.now();
    pageVisibleRef.current = true;
    reselectRef.current = 0;
  }, [trialIndex, phaseIndex]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (pageVisibleRef.current && !isSubmitted) {
        onScreenTimeRef.current += (now - lastVisibleTimeRef.current) / 1000;
      }
      pageVisibleRef.current = !document.hidden;
      lastVisibleTimeRef.current = now;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSubmitted]);

  // Handle user selection
  const handleSelect = (i) => {
    if (isSubmitted) return;
    if (selectedIndex !== null && selectedIndex !== i) reselectRef.current += 1;
    setSelectedIndex(i);
  };

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [isSubmitted, trialIndex, phaseIndex]);

  // Handle time-up
  const handleTimeUp = useEffectEvent(() => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    setFeedback("Time up! Incorrect");
    submitTimeRef.current = null;
    clearInterval(timerRef.current);

    if (pageVisibleRef.current) {
      onScreenTimeRef.current += (Date.now() - lastVisibleTimeRef.current) / 1000;
    }
  });

  useEffect(() => {
    if (timeLeft <= 0) handleTimeUp();
  }, [timeLeft]);

  // Save trial
  const saveTrial = async (correct, curCorrect, totalCorrect) => {
    if (!firebase_uid) return;

    const timedOut = selectedIndex === null;
    const thinkTime = ((submitTimeRef.current ?? Date.now()) - trialStartRef.current) / 1000;
    const totalTimeUsed = (Date.now() - trialStartRef.current) / 1000;

    const data = {
      trial_id: trialIndex,
      phase: phase.name,
      is_attention_check: trial.is_attention_check || false,
      is_comprehension_check: phase.is_comprehension || false,
      create_time: new Date(trialStartRef.current),
      end_time: new Date(),
      performance: correct ? 1 : 0,
      is_correct: correct,
      cur_correctness: curCorrect,
      total_correctness: totalCorrect,
      ai_choice: [],
      best_choice: [{ index: correctIndex, image: images[correctIndex] }],
      user_choice: timedOut ? [{ index: "Time out.", image: "Time out." }] : [{ index: selectedIndex, image: images[selectedIndex] }],
      reselect_num: reselectRef.current,
      think_time: timeLeft<=0 ? 30 : thinkTime,
      total_time: totalTimeUsed,
      on_screen_time: onScreenTimeRef.current>30?30:onScreenTimeRef.current,
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

  // Submit trial
  const handleSubmit = () => {
    if (selectedIndex === null) return;

    clearInterval(timerRef.current);
    submitTimeRef.current = Date.now();
    setIsSubmitted(true);
    setFeedback(selectedIndex === correctIndex ? "Correct!" : "Incorrect");

    if (pageVisibleRef.current) {
      onScreenTimeRef.current += (Date.now() - lastVisibleTimeRef.current) / 1000;
    }
  };

  // Next trial
  const handleNext = async () => {
    if (!submitTimeRef.current) submitTimeRef.current = Date.now();
    const correct = selectedIndex === correctIndex;
    const curCorrect = phaseCorrectCount + (correct ? 1 : 0);
    const totalCorrect = totalCorrectCount + (correct ? 1 : 0);

    await saveTrial(correct, curCorrect, totalCorrect);

    if (correct) {
      setPhaseCorrectCount(c => c + 1);
      setTotalCorrectCount(c => c + 1);
    }

    setSelectedIndex(null);
    setIsSubmitted(false);
    setFeedback(null);
    setTimeLeft(30);

    if (trialIndex + 1 < phase.trials.length) {
      setTrialIndex(t => t + 1);
      return;
    }

    if (phaseIndex + 1 < PHASES.length) {
      alert(`${phase.name} complete. Moving to ${PHASES[phaseIndex + 1].name}.`);
      setPhaseIndex(p => p + 1);
      setTrialIndex(0);
      setPhaseCorrectCount(0);
      return;
    }

    alert("All phases complete! Thank you for participating.");
    if (onFinish) onFinish();
  };

  // Styles
  const btnBase = { padding: "12px 22px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "1.1rem", fontWeight: 600, transition: "all 0.2s ease" };
  const actionBtn = { ...btnBase, backgroundColor: "#333", color: "#fff" };
  const actionBtnDisabled = { backgroundColor: "#999", cursor: "not-allowed" };

  const selectedRowCol = selectedIndex !== null ? getRowCol(selectedIndex) : null;
  const correctRowCol = getRowCol(correctIndex);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        {phase.name} — Trial {trialIndex + 1} / {phase.trials.length}
      </h2>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* LEFT PANEL */}
        <div style={{ width: "35%", display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>Time Remaining: {timeLeft}s</div>
          <div style={{ background: "#f2f2f2", padding: 10, borderRadius: 8 }}>
            <b>Instruction:</b> Select the image that matches the target class.
          </div>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>
            Target Class: <span style={{ color: "blue" }}>Example Label {correctIndex}</span>
          </div>
          <div>
            <b>Your Selection:</b>{" "}
            {selectedRowCol
              ? `Row ${selectedRowCol.row}, Col ${selectedRowCol.col} `
              : "None"}
          </div>

          <div style={{ marginTop: 10 }}>
            {!isSubmitted ? (
              <button
                style={{ ...actionBtn, ...(selectedIndex === null ? actionBtnDisabled : {}) }}
                onClick={handleSubmit}
                disabled={selectedIndex === null}
              >
                Confirm and Submit
              </button>
            ) : (
              <button style={actionBtn} onClick={handleNext}>Next Problem</button>
            )}
          </div>

          {isSubmitted && (
            <p style={{ marginTop: 10, color: feedback === "Correct!" ? "green" : "red", fontWeight: "bold" }}>
              {feedback} <br />
              {feedback !== "Correct!" && (
                <>Correct Image: Row {correctRowCol.row}, Col {correctRowCol.col} </>
              )}
            </p>
          )}
        </div>

        {/* RIGHT PANEL — IMAGE GRID */}
        {/* RIGHT PANEL — IMAGE GRID WITH ROW/COL LABELS */}
<div style={{ width: "65%", position: "relative" }}>
  {/* Column numbers */}
  <div style={{ display: "flex", marginLeft: 30, marginBottom: 5 }}>
    {[...Array(columns)].map((_, c) => (
      <div key={c} style={{ width: 140, textAlign: "center", fontWeight: "bold" }}>
        {c}
      </div>
    ))}
  </div>

  {/* Grid with row labels */}
  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
    {images.map((img, i) => {
      const { row, col } = getRowCol(i);
      const isSelected = selectedIndex === i;
      const isCorrect = isSubmitted && i === correctIndex;

      return (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          {/* Row label only at start of each row */}
          {col === 0 && (
            <div style={{
              width: 30,
              textAlign: "center",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {row}
            </div>
          )}
          {/* Image */}
          <div
            onClick={() => handleSelect(i)}
            style={{
              width: 140,
              height: 140,
              border: isSelected ? "3px solid blue" : "1px solid #ccc",
              backgroundColor: isCorrect ? "lightgreen" : "white",
              padding: 5,
              cursor: isSubmitted ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={img} style={{ maxWidth: "100%", maxHeight: "100%" }} />
          </div>
        </div>
      );
    })}
  </div>
</div>

      </div>
    </div>
  );
}








