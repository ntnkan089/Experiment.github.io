import { useState, useEffect } from "react";
import { db } from "../config/firestore.js";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function Consent({ onNext, firebase_uid }) {
  const [checked, setChecked] = useState(false);
  const url = import.meta.env.BASE_URL;

  // Write metadata on component load
  useEffect(() => {
    if (!firebase_uid) return;

    const writeMetadata = async () => {
      try {
        const docRef = doc(db, "user", firebase_uid);
        await setDoc(
          docRef,
          { consentPageVisited: true, timestamp: serverTimestamp() },
          { merge: true }
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

      onNext();
    } catch (err) {
      console.error("Error saving consent:", err);
      alert("Failed to record consent. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}>
        <div>
          <h3 style={{ color: "#0064a4", textAlign: "left", margin: 0 }}>
            <b>Welcome to the experiment!</b>
          </h3>
          <p style={{ color: "red", textAlign: "left", marginTop: 5 }}>
            <b>Please carefully read the information below before you decide to participate in this study.</b>
          </p>
        </div>

        <img
          src={`${url}images/uci_seal.png`}
          alt="UCI Logo"
          style={{ width: 120, height: "auto", objectFit: "contain" }}
        />
      </div>

      <hr />

      <h3 style={{ textAlign: "center" }}>
        <b>Study Information Sheet</b>
      </h3>

      {/* FULL STUDY TEXT */}
      <div style={{ textAlign: "left" }}>

        <p>
          Please carefully read the information below before you decide to participate in this study. 
          If you have any questions, please contact the lead researcher.
        </p>

        <p>
          Participation in this study is voluntary. There are no alternative procedures available. 
          The only alternative is not to participate in this study. You may refuse to participate or 
          withdraw at any time.
        </p>

        <h4><b>User Study on Human Learning and Reliance on Artificial Intelligence</b></h4>

        <h4><b>Project Summary</b></h4>
        <p>TODO</p>

        <h4><b>Time Commitment</b></h4>
        <p>
          This study typically takes less than <b>50 minutes</b> to complete.
        </p>

        <h4><b>Benefits & Risks</b></h4>
        <p>
          There is no risk in participating in this study. 
          There are no direct benefits from participation in the study.
        </p>

        <h4><b>Eligibility Requirements</b></h4>
        <ul>
          <li>United States citizen/resident</li>
          <li>18 years or older</li>
          <li>English speaker</li>
          <li>A holder of an undergraduate degree (BA/BSc/other) or higher</li>
        </ul>

        <h4><b>Reimbursement & Compensation</b></h4>
        <p>
          You will receive <b>$TODO USD</b> for your participation via Prolific.<br />
          If your performance is excellent, you will receive up to an additional <b>$TODO USD</b>.<br /><br />
          <b>Note:</b> If your performance is below a minimal threshold for quality, 
          you will not be compensated. This study includes comprehension and attention checks 
          to ensure participants complete the tasks honestly and thoroughly. 
          If you fail these checks, you will not be compensated.
        </p>
        <p>
          Do not refresh your browser during the study, as it will cause data loss 
          and you will not be compensated.
        </p>

        <h4><b>Confidentiality & Anonymity</b></h4>
        <p>
          All research data collected will be stored securely and confidentially on a password 
          protected server indefinitely. Identifying details will not be associated with any 
          data you provide as part of any publication or presentation.
        </p>

        <h4><b>Future Research Use</b></h4>
        <p>
          Once the study is done, we may share the information collected with other researchers 
          so they can use it for other studies in the future.
        </p>

        <h4><b>Contact Information</b></h4>
        <p>
          University of California, Irvine — Department of Computer Science<br />
          <b>Lead Researcher:</b> Shang Wu (shangw13@uci.edu)<br />
          <b>Faculty Sponsor:</b> Padhraic Smyth (smyth@ics.uci.edu)
        </p>

        <hr />

        {/* Consent Checkbox */}
        <div style={{
          border: "2px solid #0064a4",
          background: "rgba(0,0,0,0.02)",
          padding: 12,
          marginBottom: 20,
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />{" "}
          <b>Check here</b> to confirm that:
          <ul>
            <li>You have read and understood this Study Information Sheet</li>
            <li>You are taking part voluntarily</li>
            <li>You meet the eligibility requirements</li>
            <li>You agree that your anonymized data may be shared in public repositories</li>
            <li>You will complete this study independently, without external help/tools/people</li>
          </ul>
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
