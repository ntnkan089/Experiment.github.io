import { useState, useEffect } from "react";

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
export default function App() {
  const [page, setPage] = useState("consent");

  const [firebaseUID, setFirebaseUID] = useState(null);
  // GROUP MAPPING
  // ==========
  const searchParams = new URLSearchParams(window.location.search);
  const groupCode = searchParams.get("g");
  const qgroup = parseInt(searchParams.get("qgr")) || 0;
const isDev =
  import.meta.env.MODE === "development"

const [PID] = useState(() => {

  if (isDev) {
    let pid = sessionStorage.getItem("TEST_PID");
    if (!pid) {
      pid = `test_${uuidv4()}`;
      sessionStorage.setItem("TEST_PID", pid);
    }
    return pid;
  } else {
    return searchParams.get("PROLIFIC_PID") || "none";
  }
});

  const OK = PID && PID !== "none"; // ==========
const [isDuplicate, setIsDuplicate] = useState(false);
useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUID(user.uid);
        console.log("Firebase UID:", user.uid);
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (!PID) return;

    const checkDuplicate = async () => {
      try {
        const docRef = doc(db, "user", PID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Already exists → duplicate detected
          setIsDuplicate(true);
          console.log("Duplicate PID detected:", PID);
        } else {
          // First time → create record
          await setDoc(docRef, { consentPageVisited: true, timestamp: serverTimestamp() });
          console.log("Metadata written for new PID:", PID);
        }
      } catch (err) {
        console.error("Error checking/creating PID:", err);
      }
    };

    checkDuplicate();
  }, []);
  const GROUP_MAP = {
    alp: "no-ai",
    epsi: "with-ai",
    check: "difficulty-check",
    test: "test"
  };
  const group = GROUP_MAP[groupCode] || "no-ai";

  // Use 'derivedGroup' throughout your component
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
              onComplete={() => setPage("learning")}
              onFail={() =>
                (window.location.href =
                  "https://app.prolific.co/submissions/complete?cc=XXXX")
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
                  alert("Experiment completed!");
                  setPage("complete");
                }}
              />
            ) : group !== "test"? (
              <Experiment
                firebase_uid={firebaseUID}
                PID={PID}
                group={group}
                onFinish={() => {
                  alert("Experiment completed!");
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