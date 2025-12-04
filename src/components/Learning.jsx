import { useState, useEffect, useRef } from "react";

const url = import.meta.env.BASE_URL;
const ALL_IMAGES = [
  "image_02018.jpg","image_02296.jpg","image_02408.jpg","image_02512.jpg","image_02533.jpg",
  "image_02598.jpg","image_02612.jpg","image_02685.jpg","image_02732.jpg","image_02770.jpg",
  "image_04510.jpg","image_04530.jpg","image_04614.jpg","image_04641.jpg","image_04843.jpg"
];

const CLASS_COUNT = 3;
const IMAGES_PER_CLASS = 4;

function getClassImages() {
  const classes = [];
  for (let i = 0; i < CLASS_COUNT; i++) {
    classes.push(ALL_IMAGES.slice(i * IMAGES_PER_CLASS, (i + 1) * IMAGES_PER_CLASS));
  }
  return classes.map(cls => cls.map(img => `${url}/images/test_images/${img}`));
}

export default function LearningPage({ onNext }) {
  const classes = getClassImages();
  const [timeLeft, setTimeLeft] = useState(5*1); // 5 minutes in seconds
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      alert("Time is up! You will now proceed to the experiment.");
      if (onNext) onNext();
    }
  }, [timeLeft, onNext]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Learning Phase</h2>

      <div style={{ fontSize: 18, marginBottom: 20, textAlign: "center" }}>
        You have 5 minutes to review the classes and their example images shown below.
      </div>

      <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 30, textAlign: "center" }}>
        Time Remaining: {formatTime(timeLeft)}
      </div>

      {classes.map((clsImages, clsIdx) => (
        <div
          key={clsIdx}
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: 40,
            gap: 20,
          }}
        >
          {/* Class label on the left */}
          <div style={{ width: 150, fontSize: 18, fontWeight: "bold" }}>
            Class {clsIdx + 1}
          </div>

          {/* Images on the right */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {clsImages.map((img, i) => (
              <div
                key={i}
                style={{
                  width: 140,
                  height: 140,
                  border: "1px solid #ccc",
                  padding: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={img} style={{ maxWidth: "100%", maxHeight: "100%" }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
