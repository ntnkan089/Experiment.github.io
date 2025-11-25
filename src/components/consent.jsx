import { useState, useEffect } from "react";
import { db } from "../config/firestore.js"; // import Firestore
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function Consent({ onNext, firebase_uid }) {
  const [checked, setChecked] = useState(false);

  // Write metadata on component load
  useEffect(() => {
    if (!firebase_uid) return;

    const writeMetadata = async () => {
      try {
        const docRef = doc(db, "user", firebase_uid);
        await setDoc(
          docRef,
          { consentPageVisited: true, timestamp: serverTimestamp() },
          { merge: true } // merge to avoid overwriting other fields
        );
        console.log("Metadata written for UID:", firebase_uid);
      } catch (err) {
        console.error("Error writing metadata:", err);
      }
    };

    writeMetadata();
  }, [firebase_uid]);

  const handleSubmitConsent = async () => {
    if (!checked) return;

    try {
      const userRef = doc(db, "user", firebase_uid);
      await updateDoc(userRef, {
        consentGiven: true,
        consentTimestamp: serverTimestamp(),
      });
      console.log("Consent recorded for UID:", firebase_uid);

      onNext(); // proceed to next page
    } catch (err) {
      console.error("Error saving consent:", err);
      alert("Failed to record consent. Please try again.");
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h3 style={{ color: "#0064a4", textAlign: "left", margin: 0 }}>
            <b>Welcome to the experiment!</b>
          </h3>
          <p style={{ color: "red", textAlign: "left", marginTop: 5 }}>
            <b>Please read the information below carefully before participating.</b>
          </p>
        </div>

        <img
          src="/images/uci_seal.png"
          alt="UCI Logo"
          style={{ width: 120, height: "auto", objectFit: "contain" }}
        />
      </div>

      <hr />

      <h3 style={{ textAlign: "center" }}>
        <b>Participant Information Sheet</b>
      </h3>

      {/* Participant Info */}
      <div style={{ textAlign: "left" }}>
        <h4><b>Project Summary</b></h4> 
        <p>We aim to study how humans interact with AI when making decisions.</p>
        <h4><b>Time Commitment</b></h4> 
        <p><b>20–30 minutes</b> to complete.<br /><u>Note:</u> This page will not save progress.</p> 
        <h4><b>Benefits & Risks</b></h4> 
        <p>No direct participant benefits.</p>
        <h4><b>Eligibility Requirements</b></h4> 
        <ul>
          <li>United States citizen/resident</li>
          <li>18+ years old</li>
          <li>English speaker</li>
          <li>HTML5-compatible browser</li>
        </ul>
        <h4><b>Compensation</b></h4>
        <p><b>$5.00 USD</b> via Prolific.</p>
        <h4><b>Confidentiality</b></h4>
        <p>Data will be stored securely and anonymously.</p>
        <h4><b>Contact Information</b></h4>
        <p>
          UC Irvine — Cognitive Sciences <br />
          <b>Lead Researcher:</b> Example Name (email@uci.edu) <br />
          <b>Faculty Sponsor:</b> Example Sponsor (email@uci.edu)
        </p>

        <hr />

        {/* CONSENT CHECKBOX */}
        <div
          style={{
            border: "2px solid #0064a4",
            background: "rgba(0,0,0,0.02)",
            padding: 12,
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <b> Check here</b> to confirm that:
          you have read and understood the <i>Participant Information Sheet</i>,
          you are taking part in this research study voluntarily,
          you meet the eligibility requirements,
          and you are agreeing that your anonymized data may be shared in public repositories.
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: "center" }}>
          <button
            disabled={!checked}
            onClick={handleSubmitConsent}
            style={{
              padding: "8px 14px",
              background: checked ? "#0064a4" : "#888",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: checked ? "pointer" : "not-allowed",
            }}
          >
            Submit and Proceed
          </button>
        </div>
      </div>
    </div>
  );
}



