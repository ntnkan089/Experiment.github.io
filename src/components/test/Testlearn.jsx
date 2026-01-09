import { useState, useEffect, useRef } from "react";
import { db } from "../../config/firestore.js";
import { doc, setDoc } from "firebase/firestore";

const url = import.meta.env.BASE_URL;


export default function TestLearningPage({ onNext, PID }) {
  const [manifest, setManifest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 3);
  const timerRef = useRef(null);
const onScreenTimeRef = useRef(0);     // milliseconds
const lastVisibleTimeRef = useRef(0);
const pageVisibleRef = useRef(true);
useEffect(() => {
   
    onScreenTimeRef.current = 0;
    lastVisibleTimeRef.current = Date.now();
    pageVisibleRef.current = true;
  const handleVisibilityChange = () => {
    const now = Date.now();

    if (pageVisibleRef.current) {
      onScreenTimeRef.current += now - lastVisibleTimeRef.current;
    }

    pageVisibleRef.current = !document.hidden;
    lastVisibleTimeRef.current = now;
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);

  /* load manifest */
  useEffect(() => {
fetch(`${import.meta.env.BASE_URL}manifest.json`)      .then(res => res.json())
      .then(data => setManifest(data))
  }, []);

  /* timer */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);


const hasSavedRef = useRef(false);

useEffect(() => {
  const updateLearningOnScreenTime = async (onScreenTimeMs) => {
    if (!PID) return;

    try {
      await setDoc(
        doc(db, "user", PID),
        {
          learning: {
            on_screen_time_ms: onScreenTimeMs,
            expected_ms: 300000,
            timestamp: Date.now(),
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to update learning on-screen time:", err);
    }

  };
  if (timeLeft <= 0 && !hasSavedRef.current) {
    hasSavedRef.current = true;

    const now = Date.now();

    if (pageVisibleRef.current) {
      onScreenTimeRef.current += now - lastVisibleTimeRef.current;
    }

    const onScreenTimeMs = onScreenTimeRef.current;

    console.log("Learning on-screen time (ms):", onScreenTimeMs);

    updateLearningOnScreenTime(onScreenTimeMs);

    alert("Time is up! Proceeding to experiment.");
    onNext?.();
  }
}, [timeLeft, onNext, PID]);


  const formatTime = sec =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  if (!manifest) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Learning Phase Test
      </h2>

      <div style={{ textAlign: "center", fontSize: 18}}>
        Review each flower class and its example images.
        
      </div>
      <div style={{ textAlign: "center", fontSize: 18, marginBottom: 10 }}>
        <b>Note:</b> The displayed examples represent only a subset of the species and are not exhaustive.
        
      </div>

      <div style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", marginBottom: 50 }}>
        Time Remaining: {formatTime(timeLeft)}
      </div>
<div
          
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 32,
            gap: 24,
          }}
        >
          {/* Class info */}
          <div style={{ width: 200 }}>
            
            <div style={{ fontSize: 21, fontWeight: "bold", color:"red" }}>
              Class Name
            </div>
          </div>
          <div style={{ width: 460 }}>
            
            <div style={{ fontSize: 21, fontWeight: "bold", color:"red" }}>
              Example Images
            </div>
          </div>
          </div>
      {Object.entries(manifest)
  .sort((a, b) => Number(a[1].classLabel) - Number(b[1].classLabel))
  .map(([key, cls]) => ( 

        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 32,
            gap: 24,
          }}
        >
          {/* Class info */}
          <div style={{ width: 200 }}>
            
            <div style={{ fontSize: 21, fontWeight: "bold" }}>
              {cls.species[0].toUpperCase() + cls.species.slice(1)}
            </div>
          </div>

          {/* Images */}
          <div style={{ display: "flex", gap: 12 }}>
            {cls.images.map((img, i) => (
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
                <img
                  src={`${url}/images/${img}`}
                  alt={cls.species}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
