import { useState, useEffect, useEffectEvent, useRef } from "react";
import { db } from "../config/firestore.js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { shuffleArray } from "./utils/Assign.jsx";
const url = import.meta.env.BASE_URL;





export default function DifficultyCheck({ PID, group, qgroup, onFinish }) {

  // Refs
  const trialStartRef = useRef(0);
  const submitTimeRef = useRef(0);
  const timerRef = useRef(null);
  const onScreenTimeRef = useRef(0);
  const lastVisibleTimeRef = useRef(0);
  const pageVisibleRef = useRef(true);
  const reselectRef = useRef(0);
const [trialKey, setTrialKey] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // State
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(32);
  const [phaseCorrectCount, setPhaseCorrectCount] = useState(0);
  const [totalCorrectCount, setTotalCorrectCount] = useState(0);
  const [trials, setTrials] = useState([]);

const [nextDisabled, setNextDisabled] = useState(false);

  // Select experiment structure based on group
const EFFECTIVE_PHASES = [{
        name: "Difficulty Check",
        trials: trials
      }]
   
 useEffect(() => {
    trialStartRef.current = Date.now();
    submitTimeRef.current = 0;
    onScreenTimeRef.current = 0;
    lastVisibleTimeRef.current = Date.now();
    pageVisibleRef.current = true;
    reselectRef.current = 0;
    setNextDisabled(false);
    setTimedOut(false);

  }, [trialIndex, phaseIndex]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (pageVisibleRef.current) {
        onScreenTimeRef.current += (now - lastVisibleTimeRef.current);
      }
      pageVisibleRef.current = !document.hidden;
      lastVisibleTimeRef.current = now;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

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
 
useEffect(() => {
  fetch(`${url}questions.json`)
    .then(r => r.json())
    .then(async allTrials => {
      // Compute start/end index based on group
      const groupSize = 10;
      const start = qgroup * groupSize;
      const end = start + groupSize;
      const assigned = allTrials.slice(start, end);
      console.log("Assigned difficulty check problems:", assigned);
      const shuffled = shuffleArray(assigned);
      console.log("Shuffled difficulty check problems:", shuffled);
      const diff = [
        ...shuffled.slice(0, 5), // first 5 questions
        {
          ...shuffled[4],       // copy Q5 for attention check
          is_attention_check: true,
          instruction:
            "This is an attention check. Please select (row 3, column 4) — the lower right corner picture — to pass this attention check.",
          correctAnswerIndex: 11, // row 3, col 4 (0-based)
          trueClassName: "attention check",
          trueAnswerLabel: 0,
        },
        ...shuffled.slice(5),   // remaining questions
      ]; 
      setTrials(diff);
    });
}, [qgroup]);


const phase = EFFECTIVE_PHASES[phaseIndex];
const trial = phase.trials[trialIndex];

const images = trial?.selectedImages;
const correctIndex = trial?.correctAnswerIndex;
useEffect(() => {
  images?.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}, [images]);
 const handleTimeUp = useEffectEvent(() => {
    if (isSubmitted) return;
    setTimedOut(true);

    setIsSubmitted(true);
    if(!selectedIndex||selectedIndex!==correctIndex)
      {
        setFeedback("Time up! You did not submit a selection.")
      }
    else{
      setFeedback("Time up! You did not submit a selection.")
    }
    submitTimeRef.current = null;
    clearInterval(timerRef.current);

    if (pageVisibleRef.current) {
      onScreenTimeRef.current += (Date.now() - lastVisibleTimeRef.current);
    }
  });

  useEffect(() => {
    if (timeLeft <= 0) handleTimeUp();
  }, [timeLeft]);
if (
  EFFECTIVE_PHASES.length === 0 ||
  !EFFECTIVE_PHASES[phaseIndex] ||
  EFFECTIVE_PHASES[phaseIndex].trials.length === 0
) {
  return <div>Loading experiment…</div>;
}



if (!trials.length) {
  return <div>Loading…</div>;
}



  const columns = 4; // number of columns in the grid
  //const rows = Math.ceil(images.length / columns);

const getRowCol = (i) => ({
  row: Math.floor(i / columns)+1,
  col: (i % columns),
});

  // Reset trial
 
  // Save trial
  const saveTrial = async (correct, curCorrect, totalCorrect, timedOut) => {
    if (!PID) return;

    const thinkTime = ((submitTimeRef.current ?? Date.now()) - trialStartRef.current) ;
    const totalTimeUsed = (Date.now() - trialStartRef.current) ;

    const data = {
      timed_out: timedOut,
      trial_id: trialIndex,
      phase: phase.name,
      true_label: trial.trueAnswerLabel,
      true_class: trial.trueClassName,
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
      user_choice: timedOut ? [{ index: "", image: "" }] : [{ index: selectedIndex, image: images[selectedIndex] }],
      reselect_num: reselectRef.current,
      think_time: timeLeft<=0 ? 30000 : thinkTime,
      total_time: totalTimeUsed,
      on_screen_time: onScreenTimeRef.current>totalTimeUsed?totalTimeUsed:onScreenTimeRef.current,
      timestamp: serverTimestamp(),
    };

    const docRef = doc(
      db,
      "user",
      PID,
      "experiment",
      phase.name,
      "trial",
    trial.is_attention_check ? `attention-check` : `trial-${trialIndex}`
    );

    await setDoc(docRef, data);/* 
    console.log("Trial saved:", data); */
  };

  // Submit trial
  const handleSubmit = () => {
    if (selectedIndex === null) return;

    clearInterval(timerRef.current);
    submitTimeRef.current = Date.now();
    setIsSubmitted(true);
    setFeedback(selectedIndex === correctIndex ? "Correct!" : "Incorrect");

    
  };

  // Next trial
  const handleNext = async () => {
    if (nextDisabled) return;   // guard
  setNextDisabled(true); 
    if (!submitTimeRef.current) submitTimeRef.current = Date.now();
    const correct = !timedOut && (selectedIndex === correctIndex);
    const curCorrect = phaseCorrectCount + (!timedOut &&correct ? 1 : 0);
    const totalCorrect = totalCorrectCount + (!timedOut &&correct ? 1 : 0);
    if (pageVisibleRef.current) {
      onScreenTimeRef.current += (Date.now() - lastVisibleTimeRef.current) ;
    }
    await saveTrial(correct, curCorrect, totalCorrect, timedOut);
   
    if (correct) {
      setPhaseCorrectCount(c => c + 1);
      setTotalCorrectCount(c => c + 1);
    }

    setSelectedIndex(null);
    setIsSubmitted(false);
    setFeedback(null);
    setTimeLeft(30);

    if (trialIndex + 1 < phase.trials.length) {
      setTrialKey(k => k + 1);
      setTrialIndex(t => t + 1);
      return;
    }

    if (group === "difficulty-check") {
      if (trialIndex + 1 < phase.trials.length) {
        setTrialKey(k => k + 1);
        setTrialIndex(t => t + 1);
        return;
      }

      alert("Thanks for completing the main study! Please take a moment to complete a brief survey.");
      if (onFinish) onFinish();
      return;
    }

    // Default multi-phase flow (AI / No-AI conditions)
    if (phaseIndex + 1 < EFFECTIVE_PHASES.length) {
      alert(`${phase.name} complete. Moving to ${EFFECTIVE_PHASES[phaseIndex + 1].name}.`);
      setPhaseIndex(p => p + 1);
      setTrialKey(k => k + 1);
      setTrialIndex(0);
      setPhaseCorrectCount(0);
      return;
    }

    alert("Thanks for completing the main study! Please take a moment to complete a brief survey.");
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
         {trial.trueClassName === "attention check"? "Attention Check":`Problem ${trialIndex + 1}`}
      </h2>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* LEFT PANEL */}
        <div style={{ width: "35%", display: "flex", flexDirection: "column", gap: 15 }}>
          <div className="no-select" style={{ fontSize: 20, fontWeight: "bold" }}>Time Remaining: {timeLeft}s</div>
          <div className="no-select" style={{ background: "#f2f2f2", padding: 10, borderRadius: 8 }}>
            <b>Instruction:</b> {trial.instruction? trial.instruction : "Select the image that matches the target class."}
          </div>
          {!trial.is_attention_check && 
          <div className="no-select" style={{ fontSize: 18, fontWeight: "bold" }}>
            Target Class: <span style={{ color: "blue" }}> {trial?.trueClassName[0].toUpperCase()+trial?.trueClassName.slice(1)}</span>
          </div>
          }
          <div className="no-select">
            <b>Your Selection:</b>{" "}
            {selectedRowCol
              ? `Row ${selectedRowCol.row}, Col ${selectedRowCol.col+1} `
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
              <button style={actionBtn}  disabled={nextDisabled} onClick={handleNext}>Next Problem</button>
            )}
          </div>

          {isSubmitted && (
            <p style={{ marginTop: 10, color: feedback === "Correct!"||feedback ==="Time up! Correct" ? "green" : "red", fontWeight: "bold" }}>
              {feedback} <br />
              {feedback !== "Correct!" && (
                <>Correct Image: Row {correctRowCol.row}, Col {correctRowCol.col+1} </>
              )}
            </p>
          )}
        </div>

        {/* RIGHT PANEL — IMAGE GRID */}
        {/* RIGHT PANEL — IMAGE GRID WITH ROW/COL LABELS */}
<div style={{ width: "58%", position: "relative" }}>
  {/* Column numbers */}
  <div style={{ display: "flex", marginLeft: 30, marginBottom: 5, justifyItems: "center" }}>
    {[...Array(columns)].map((_, c) => (
      <div key={c} style={{ width: 140, textAlign: "center", fontWeight: "bold" }}>
        {c==0? `Column ${c+1}`:c+1}
      </div>
    ))}
  </div>

  {/* Grid with row labels */}
  <div
  style={{
    display: "grid",
    gridTemplateColumns: "40px repeat(4, 140px)", // label + 4 images
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {images.map((img, i) => {
    const row = Math.floor(i / columns) + 1;
    const isSelected = selectedIndex === i;
    const isCorrect = isSubmitted && i === correctIndex;

    return (
      <>
        {/* Row label only at row start */}
        {i % columns === 0 && (
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {row==1 ? `Row ${row}` : row}
          </div>
        )}

        {/* Image cell */}
        <div
            key={`${trialKey}-${i}`}                      onClick={() => handleSelect(i)}
          style={{
            width: 128,
            height: 128,
            overflow: "hidden", 
            border: isSelected ? "3px solid blue" : "1px solid #ccc",
            backgroundColor: isCorrect ? "lightgreen" : "white",
            padding: 3,
            cursor: isSubmitted ? "default" : "pointer",
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={img} loading="eager"
            decoding="async"  
            style={{ 
              maxWidth: "100%", maxHeight: "100%" ,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block", 
            }} 
      />
        </div>
      </>
    );
  })}
</div>

</div>

      </div>
    </div>
  );
}








