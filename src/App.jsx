import { useState, useEffect, useMemo, useEffectEvent } from "react";

import Consent from "./components/consent.jsx";
import Instructions from "./components/Instructions.jsx";
import IntegrityPledge from "./components/IntegrityPledge.jsx";
import Experiment from "./components/Experiment.jsx";

import Complete from "./components/Complete.jsx";
import Header from "./components/Header.jsx";
import LearningPage from "./components/Learning.jsx";
import ComprehensionCheck from "./components/Comprehension.jsx";
import { auth } from "./config/firestore.js";
import DifficultyCheck from "./components/DiffCheck.jsx";
import { v4 as uuidv4 } from "uuid";

import DuplicateParticipationModal from "./components/Block.jsx";

import { db } from "./config/firestore.js";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import TestExperiment from "./components/test/Testexp.jsx";
import TestLearningPage from "./components/test/Testlearn.jsx";


const useQueryParams = () =>
  useMemo(() => new URLSearchParams(window.location.search), []);


export default function App() {
    const searchParams = useQueryParams();

  const groupCode = searchParams.get("g");
  const qgroup = Number(searchParams.get("qgr")) || 0;
  

  const isDev = import.meta.env.MODE === "development";

  /* =====================================================
     PAGE STATE
  ===================================================== */
  const [page, setPage] = useState("consent");

  /* =====================================================
     FIREBASE AUTH
  ===================================================== */
  const [firebaseUID, setFirebaseUID] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        setFirebaseUID(user.uid);
        console.log("Firebase UID:", user.uid);
      }
    });
    return unsub;
  }, []);

  /* =====================================================
     PID STATE (PURE INIT)
  ===================================================== */
  const [PID, setPID] = useState(() => {
  if (!isDev) {
    // Production: use PROLIFIC_PID from URL or fallback
    const pid = searchParams.get("PROLIFIC_PID");
    return pid ? pid : "none";
  }

  // Development: prefer PROLIFIC_PID from URL, fallback to sessionStorage
  const urlPID = searchParams.get("PROLIFIC_PID");
  const storedPID = sessionStorage.getItem("TEST_PID");
  return urlPID || storedPID || null; // null means we will generate later
});


  /* =====================================================
     PID GENERATION (SIDE EFFECT)
  ===================================================== */

const generatePID = useEffectEvent(() => {
  if (PID) return; // Already exists → do nothing

  const pid = `test_${uuidv4()}`;
  sessionStorage.setItem("TEST_PID", pid);
  setPID(pid);
});

useEffect(() => {
  if (!isDev) return;

  generatePID(); // Run safely after render
}, [isDev]);

  const OK = PID && PID !== "none";

  /* =====================================================
     DUPLICATE CHECK (FIRESTORE)
  ===================================================== */
  const [isDuplicate, setIsDuplicate] = useState(false);


const checkDuplicate = useEffectEvent(async (pid) => {
  console.log("Checking duplicate for PID:", pid);
  if (!pid || pid === "none"|| !firebaseUID){
    console.log(pid); 
    return;
  }

  try {
    const ref = doc(db, "user", pid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setIsDuplicate(true);
      console.log("Duplicate PID detected:", pid);
    } else {
      await setDoc(ref, {
        consentPageVisited: true,
        timestamp: serverTimestamp(),
        group: groupCode || "undefined",
        qgr: qgroup,
        pass_comprehension: false,
        finish_comprehension: false,
        PID: pid,
      });
      console.log("Metadata written for new PID:", pid);
    }
  } catch (err) {
    console.error("PID check failed:", err);
  }
});

useEffect(() => {
  if (!PID) return;
  if (!firebaseUID) return;

  checkDuplicate(PID);
}, [PID, firebaseUID]);

  /* =====================================================
     GROUP MAPPING (DERIVED)
  ===================================================== */
  const group = useMemo(() => {
    const GROUP_MAP = {
      alp: "no-ai",
      epsi: "with-ai",
      check: "difficulty-check",
      test: "test",
    };
    return GROUP_MAP[groupCode] || "no-ai";
  }, [groupCode]);

  console.log("Experiment group:", group);

  // ==========
  // FIREBASE AUTH
  // ==========
  

  // ==========
  // STYLES
  // ==========
  const appStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  };

  const containerStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f9f9f9",
  };

  // ==========
  // RENDER FLOW
  // ==========
 // Determine duplicate status synchronously

// Determine duplicate status synchronously

return (
  <>
    {/* Modal always rendered; opens only if duplicate */}
    <DuplicateParticipationModal open={isDuplicate||!OK} />

    {/* Only render study flow if not duplicate */}
    {OK&&!isDuplicate && (
      <div style={appStyle}>
        <Header title="" />

        <div style={containerStyle}>
          {page === "consent" && firebaseUID && (
            <Consent
              firebase_uid={firebaseUID}
              PID={PID}
              group={group}
              onNext={() => setPage("instructions")}
            />
          )}

          {page === "instructions" && (
            <Instructions
              group={group}
              onNext={() => setPage("pledge")}
              onBack={() => setPage("consent")}
              PID = {PID}
            />
          )}

          {page === "pledge" && (
            <IntegrityPledge
              firebase_uid={firebaseUID}
              PID={PID}
              group={group}
              onNext={() => setPage("comprehension")}
              onBack={() => setPage("instructions")}
            />
          )}

          {page === "comprehension" && (
            <ComprehensionCheck
              group={group}
              PID={PID}
              onComplete={() => setPage("learning")}
              onFail={() =>
                (window.location.href =
                  "https://app.prolific.com/submissions/complete?cc=C1I443S2")
              }
            />
          )}

          {page === "learning" && (
            group === "test"?
            (<TestLearningPage
              firebase_uid={firebaseUID}
              PID={PID}
              group={group}
              onNext={() => setPage("experiment")}
            />):(
            <LearningPage
              firebase_uid={firebaseUID}
              PID={PID}
              group={group}
              onNext={() => setPage("experiment")}
            />
          ))}

          {page === "experiment" && firebaseUID && (
            group === "difficulty-check" ? (
              <DifficultyCheck
                firebase_uid={firebaseUID}
                PID={PID}
                group={group}
                qgroup={qgroup}
                onFinish={() => {
                  setPage("complete");
                }}
              />
            ) : group !== "test"? (
              <Experiment
                firebase_uid={firebaseUID}
                PID={PID}
                group={group}
                onFinish={() => {
                  setPage("complete");
                }}
              />
            ):(<TestExperiment
                firebase_uid={firebaseUID}
                PID={PID}
                group={group}
                onFinish={() => {
                  setPage("complete");
                }}
            />)
          )}

          {page === "complete" && firebaseUID && (
            <Complete
              firebase_uid={firebaseUID}
              PID={PID}
              group={group}
            />
          )}
        </div>
      </div>
    )}
  </>
);
}