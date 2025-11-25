import { useState, useEffect } from "react";
import Consent from "./components/consent";
import Instructions from "./components/Instructions";
import IntegrityPledge from "./components/IntegrityPledge";
import Experiment from "./components/Experiment";
import Complete from "./components/Complete";
import Header from "./components/Header";
import { auth } from "./config/firestore";

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
            onNext={() => setPage("experiment")}
            onBack={() => setPage("instructions")}
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


