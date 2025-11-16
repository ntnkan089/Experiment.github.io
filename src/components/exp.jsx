// components/Experiment.jsx
import { useState, useEffect } from "react";

// Example props: onFinish is called when all trials are done
export default function Experiment({ onFinish }) {
  const totalTrials = 3; // number of problems/trials
  const totalImages = 6; // images per trial
  const targetIndices = [2, 4, 1]; // example correct indices per trial

  const [currentTrial, setCurrentTrial] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(0);

  const targetIndex = targetIndices[currentTrial];

  // Timer logic
  useEffect(() => {
    if (isSubmitted) return; // pause timer on submit
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleSelect = (index) => setSelectedIndex(index);

  const handleSubmit = () => {
    if (selectedIndex === null) return;

    setIsSubmitted(true);
    const correct = selectedIndex === targetIndex;
    setFeedback({ correct, correctIndex: targetIndex });

    // TODO: save trial data to DB here
    console.log(
      `Trial ${currentTrial + 1}: User selected ${selectedIndex}, correct: ${correct}`
    );
  };

  const handleNextProblem = () => {
    if (currentTrial + 1 < totalTrials) {
      setCurrentTrial(currentTrial + 1);
      setSelectedIndex(null);
      setIsSubmitted(false);
      setFeedback(null);
      setTimer(0);
    } else {
      // Finished all trials
      if (onFinish) onFinish();
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>
        Experiment Trial {currentTrial + 1} / {totalTrials}
      </h2>
      <p>Timer: {timer} seconds</p>
      <p>
        <b>Target:</b> Class {targetIndex}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {Array.from({ length: totalImages }).map((_, index) => (
          <div
            key={index}
            onClick={() => handleSelect(index)}
            style={{
              width: 100,
              height: 100,
              border: selectedIndex === index ? "3px solid blue" : "1px solid gray",
              backgroundColor:
                isSubmitted && index === targetIndex
                  ? "lightgreen"
                  : "lightgray",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            Image {index + 1}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {!isSubmitted ? (
          <button onClick={handleSubmit} disabled={selectedIndex === null}>
            Confirm and Submit
          </button>
        ) : (
          <button onClick={handleNextProblem}>
            {currentTrial + 1 === totalTrials ? "Finish Experiment" : "Next Problem"}
          </button>
        )}
      </div>

      {isSubmitted && feedback && (
        <div style={{ marginTop: 20 }}>
          {feedback.correct ? (
            <p style={{ color: "green" }}>Correct!</p>
          ) : (
            <p style={{ color: "red" }}>
              Incorrect. The correct image was {feedback.correctIndex + 1}.
            </p>

          )}
        </div>
      )}
    </div>
  );
}




