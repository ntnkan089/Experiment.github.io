import { useState, useEffect, useRef } from "react";
import { db } from "../config/firestore.js";
import { doc, setDoc } from "firebase/firestore";

const url = import.meta.env.BASE_URL;


export default function LearningPage({ onNext, PID }) {
  const [manifest, setManifest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 3);
  const timerRef = useRef(null);
  const onScreenTimeRef = useRef(0);     // milliseconds
  const lastVisibleTimeRef = useRef(0);
  const pageVisibleRef = useRef(true);
  const timeExpiredRef = useRef(false);

useEffect(() => {
   
    onScreenTimeRef.current = 0;
    lastVisibleTimeRef.current = Date.now();
    pageVisibleRef.current = true;
    const handleVisibilityChange = () => {
      const now = Date.now();

      // finalize previous visible segment
      if (pageVisibleRef.current) {
        onScreenTimeRef.current += now - lastVisibleTimeRef.current;
      }

      pageVisibleRef.current = !document.hidden;
      lastVisibleTimeRef.current = now;

      // 🔔 if user just came back AND time already expired
      if (!document.hidden && timeExpiredRef.current) {
        timeExpiredRef.current = false;
        alert("Time is up! Proceeding to experiment.");
        onNext?.();
      }
    };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);

}, [onNext]);

  /* load manifest */
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}manifest.json`)      
          .then(res => res.json())
          .then(data => setManifest(data))
  }, []);

  /* timer */
  useEffect(() => {
    const totalDurationMs = 5 * 60 * 1000; // 15 seconds demo; replace with real duration
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remainingSec = Math.max(Math.ceil((totalDurationMs - elapsed) / 1000), 0);
      setTimeLeft(remainingSec);

      // if time is up
      if (remainingSec <= 0) {
        clearInterval(timerRef.current);
        timeExpiredRef.current = true;

        // account for on-screen time
        const now = Date.now();
        if (pageVisibleRef.current) {
          onScreenTimeRef.current += now - lastVisibleTimeRef.current;
        }

        // save to Firestore
        if (PID) {
          setDoc(
            doc(db, "user", PID),
            {
              learning: {
                on_screen_time_ms: onScreenTimeRef.current,
                expected_ms: totalDurationMs,
                timestamp: Date.now(),
              },
            },
            { merge: true }
          ).catch(err => console.error(err));
        }

        // alert and go to next
        if (!document.hidden) {
          timeExpiredRef.current = false;
          alert("Time is up! Proceeding to experiment.");
          onNext?.();
        }
      }
    };

    tick(); // initial call
    timerRef.current = setInterval(tick, 500); // check every 0.5s

    return () => clearInterval(timerRef.current);
  }, [PID, onNext]);


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
    if (timeLeft > 0 || hasSavedRef.current) return;

    hasSavedRef.current = true;
    timeExpiredRef.current = true;

    const now = Date.now();
    if (pageVisibleRef.current) {
      onScreenTimeRef.current += now - lastVisibleTimeRef.current;
    }

    const onScreenTimeMs = onScreenTimeRef.current;
    updateLearningOnScreenTime(onScreenTimeMs);

    // 🔔 if still visible, trigger immediately
    if (!document.hidden) {
      timeExpiredRef.current = false;
      alert("Time is up! Proceeding to experiment.");
      onNext?.();
    }
  }, [timeLeft, PID, onNext]);



  const formatTime = sec =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  if (!manifest) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Learning Phase
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
