import { useState } from "react";

const url = import.meta.env.BASE_URL;

const CHECKS = [
  {
    target: "Apple",
    images: ["apple1.jpg","orange1.png","grape1.jpg"].map(
      img => `${url}/images/compre/${img}`
    ),
  },
  {
    target: "Orange",
    images: ["apple2.jpg","orange2.jpg","grape2.jpg"].map(
      img => `${url}/images/compre/${img}`
    ),
  },
];

export default function ComprehensionCheck({ onComplete, onFail }) {
  const [checkIndex, setCheckIndex] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);

  const currentCheck = CHECKS[checkIndex];
  const columns = 3;
  const rows = Math.ceil(currentCheck.images.length / columns);

  const getRowCol = (i) => ({ row: Math.floor(i / columns), col: i % columns });

  const correctIndex = currentCheck.images.findIndex(
    img => img.split("/").pop().replace(/[0-9]/g,"").replace(".jpg","").toLowerCase() === currentCheck.target.toLowerCase()
  );

  const handleSelect = (i) => setSelectedIndex(i);

  const handleSubmit = () => {
    if (selectedIndex === null) return;

    if (selectedIndex === correctIndex) {
      // Correct selection
      if (checkIndex + 1 < CHECKS.length) {
        setCheckIndex(checkIndex + 1);
        setAttempt(1);
        setSelectedIndex(null);
        setShowCorrect(false);
      } else {
        onComplete();
      }
    } else {
      if (attempt === 1) {
        // Wrong on first attempt → show correct image
        setShowCorrect(true);
        setAttempt(2);
      } else {
        // Wrong on second attempt → end study
        alert("You did not pass this comprehension check after two attempts. Study ends.");
        onFail();
      }
    }
  };

  const handleRetry = () => {
    // Clear selection and correct highlight for reattempt
    setSelectedIndex(null);
    setShowCorrect(false);
  };

  const selectedRowCol = selectedIndex !== null ? getRowCol(selectedIndex) : null;
  const correctRowCol = getRowCol(correctIndex);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Comprehension Check {checkIndex + 1} / {CHECKS.length}
      </h2>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* LEFT PANEL */}
        <div style={{ width: "35%", display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ background: "#f2f2f2", padding: 10, borderRadius: 8 }}>
            <b>Instruction:</b> Select the image that matches the target class.
          </div>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>
            Target Class: <span style={{ color: "blue" }}>{currentCheck.target}</span>
          </div>
          <div>
            <b>Your Selection:</b>{" "}
            {selectedRowCol ? `Row ${selectedRowCol.row}, Col ${selectedRowCol.col}` : "None"}
          </div>

          {showCorrect && selectedIndex !== null && (
            <div style={{ color: "red", fontWeight: "bold" }}>
              Incorrect! Correct Image: Row {correctRowCol.row}, Col {correctRowCol.col}
            </div>
          )}

          <button
            onClick={showCorrect ? handleRetry : handleSubmit}
            disabled={selectedIndex === null}
            style={{
              marginTop: 20,
              padding: "12px 22px",
              borderRadius: 8,
              border: "none",
              
              backgroundColor: selectedIndex === null ? "#999" : "#333",
              color: "#fff",
              fontWeight: 600,
              cursor: selectedIndex === null ? "not-allowed" : "pointer",
            }}
          >
            {showCorrect ? "Reattempt" : "Confirm and Submit"}
          </button>
        </div>

        {/* RIGHT PANEL — IMAGE GRID */}
        <div style={{ width: "65%" }}>
          {/* Column headers */}
          <div style={{ display: "flex", marginLeft: 40 }}>
            <div style={{ width: 40 }}></div>
            {[...Array(columns)].map((_, c) => (
              <div key={c} style={{ width: 140, textAlign: "center", fontWeight: "bold" }}>{c}</div>
            ))}
          </div>

          {/* Rows */}
          {[...Array(rows)].map((_, r) => (
            <div key={r} style={{ display: "flex", marginBottom: 12, alignItems: "center" }}>
              <div style={{ width: 40, fontWeight: "bold", textAlign: "center" }}>{r}</div>
              {currentCheck.images.slice(r * columns, (r + 1) * columns).map((img, i) => {
                const index = r * columns + i;
                const isSelected = selectedIndex === index;
                const isCorrect = showCorrect && correctIndex === index;
                return (
                  <div
                    key={i}
                    onClick={() => handleSelect(index)}
                    style={{
                      width: 140,
                      height: 140,
                      border: isSelected ? "3px solid blue" : "1px solid #ccc",
                      backgroundColor: isCorrect ? "lightgreen" : "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <img src={img} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
