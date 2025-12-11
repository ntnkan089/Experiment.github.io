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

export default function App() {
  const [page, setPage] = useState("consent");
  const [firebaseUID, setFirebaseUID] = useState(null);

  // ==========
  // GROUP MAPPING
  // ==========
  const searchParams = new URLSearchParams(window.location.search);
  const groupCode = searchParams.get("g");

  const GROUP_MAP = {
    alp: "no-ai",
    epsi: "with-ai",
    check: "difficulty-check",
  };

  const group = GROUP_MAP[groupCode] || "no-ai";

  // Use 'derivedGroup' throughout your component
  console.log("Experiment group:", group);
  // ==========
  // FIREBASE AUTH
  // ==========
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUID(user.uid);
        console.log("Firebase UID:", user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

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
  return (
    <div style={appStyle}>
      <Header title="MADLAB Experiment" />

      <div style={containerStyle}>
        {page === "consent" && firebaseUID && (
          <Consent
            firebase_uid={firebaseUID}
            group={group}
            onNext={() => setPage("instructions")}
          />
        )}

        {page === "instructions" && (
          <Instructions
            group={group}
            onNext={() => setPage("pledge")}
            onBack={() => setPage("consent")}
          />
        )}

        {page === "pledge" && (
          <IntegrityPledge
            firebase_uid={firebaseUID}
            group={group}
            onNext={() => setPage("comprehension")}
            onBack={() => setPage("instructions")}
          />
        )}

        {page === "comprehension" && (
          <ComprehensionCheck
            group={group}
            onComplete={() =>
              setPage(group === "difficulty-check" ? "experiment" : "learning")
            }
            onFail={() =>
              (window.location.href =
                "https://app.prolific.co/submissions/complete?cc=XXXX")
            }
          />
        )}

        {page === "learning" && group !== "difficulty-check" && (
          <LearningPage
            firebase_uid={firebaseUID}
            group={group}
            onNext={() => setPage("experiment")}
          />
        )}

        {page === "experiment" && firebaseUID && (
          <Experiment
            firebase_uid={firebaseUID}
            group={group}
            onFinish={() => {
              alert("Experiment completed!");
              setPage("complete");
            }}
          />
        )}

        {page === "complete" && firebaseUID && (
          <Complete firebase_uid={firebaseUID} group={group} />
        )}
      </div>
    </div>
  );
}
