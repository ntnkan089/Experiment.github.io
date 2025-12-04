import { useState, useEffect } from "react";
import Consent from "./components/consent.jsx";
import Instructions from "./components/Instructions.jsx";
import IntegrityPledge from "./components/IntegrityPledge.jsx";
import Experiment from "./components/Experiment.jsx";
import Complete from "./components/Complete.jsx";

import Header from "./components/Header.jsx";


import LearningPage from "./components/Learning.jsx";
import { auth } from "./config/firestore.js";


import ComprehensionCheck from "./components/Comprehension.jsx";
export default function App() {

  const [page, setPage] = useState("consent");
  const [firebaseUID, setFirebaseUID] = useState(null);

  const appStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh", // full viewport height
  };

  const containerStyle = {
    flex: 1, // take remaining space below header
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // vertical centering
    alignItems: "center",     // horizontal centering
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f9f9f9",
  };

  // Wait for Firebase auth user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUID(user.uid);
        console.log("Firebase UID:", user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={appStyle}>
      <Header title="MADLAB Experiment" />
      <div style={containerStyle}>
        {page === "consent" && firebaseUID && (
          <Consent firebase_uid={firebaseUID} onNext={() => setPage("instructions")} />
        )}
        {page === "instructions" && (
          <Instructions
            onNext={() => setPage("pledge")}
            onBack={() => setPage("consent")}
          />
        )}
        
        {page === "pledge" && (
          <IntegrityPledge
          firebase_uid={firebaseUID} 
            onNext={() => setPage("comprehension")}
            onBack={() => setPage("instructions")}
          />
        )}
        {page === "comprehension" && (
      <ComprehensionCheck
        onComplete={() => setPage("learning")}
          onFail={() => window.location.href = "https://app.prolific.co/submissions/complete?cc=XXXX"}    
          />
        )}
        {page === "learning" && (
          <LearningPage
          firebase_uid={firebaseUID} 
            onNext={() => setPage("experiment")}
          />
        )}
        
        {page === "experiment" && firebaseUID && (
          <Experiment
            firebase_uid={firebaseUID}
            onFinish={() => {
              alert("Experiment completed!");
              setPage("complete");
            }}
          />
        )}
        {page === "complete" && firebaseUID && (
          <Complete firebase_uid={firebaseUID} />
        )}
      </div>
    </div>
  );


}




