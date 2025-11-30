import { useState, useEffect } from "react";
import InstPage1 from "./inst/inst1.jsx";
import InstPage2 from "./inst/inst2.jsx";
import InstPage3 from "./inst/inst3.jsx";
import InstPage4 from "./inst/inst4.jsx";
import InstPage5 from "./inst/inst5.jsx";

import { db, auth } from "../config/firestore.js"; // your Firestore config
import { doc, setDoc } from "firebase/firestore";

export default function Instructions({ onNext, onBack }) {
  const pages = [
    <InstPage1 />,
    <InstPage2 />,
    <InstPage3 />,
    <InstPage4 />,
    <InstPage5 />,
  ];

  const [page, setPage] = useState(0);

  const firebase_uid = auth.currentUser?.uid;

  const updateUserInstructionPage = async (currentPage) => {
    if (!firebase_uid) return;

    try {
      // Write current instruction page under participantData/{uid}/metadata
      await setDoc(
        doc(db, "user", firebase_uid),
        { inst: currentPage },
        { merge: true } // merge so other metadata fields aren't overwritten
      );
    } catch (err) {
      console.error("Failed to update instruction page:", err);
    }
  };

  const nextPage = () => {
    const next = page + 1;
    if (next < pages.length) {
      setPage(next);
      updateUserInstructionPage(next);
    } else {
      onNext(); // Done -> move to pledge
      updateUserInstructionPage(pages.length); // last page
    }
  };

  const prevPage = () => {
    const prev = page - 1;
    if (prev >= 0) {
      setPage(prev);
      updateUserInstructionPage(prev);
    } else {
      onBack(); // Back to consent
      updateUserInstructionPage(0);
    }
  };

  // Optional: update Firestore when component mounts
  useEffect(() => {
    updateUserInstructionPage(page);
  }, []);

  return (

    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>Instructions ({page + 1}/{pages.length})</h2>

      <div style={{ marginTop: 10 }}>
        {pages[page]}
      </div>

      <div style={{ marginTop: 30 }}>
        <button onClick={prevPage}>
          {page === 0 ? "Back" : "Previous"}
        </button>

        <button onClick={nextPage} style={{ marginLeft: 10 }}>
          {page === pages.length - 1 ? "Finish Instructions" : "Next"}
        </button>
      </div>
    </div>
  );
}








