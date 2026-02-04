import { useState, useEffect } from "react";
import InstPage1 from "./inst/inst1.jsx";
import InstPage2 from "./inst/inst2.jsx";
import InstPage3 from "./inst/inst3.jsx";
import InstPage4 from "./inst/inst4.jsx";
import InstPage5 from "./inst/inst5.jsx";
import InstPage6 from "./inst/inst6.jsx";
import InstPage8 from "./inst/inst8.jsx";
import InstPage81 from "./inst/inst81.jsx";
import { db, auth } from "../config/firestore.js";
import { doc, setDoc } from "firebase/firestore";

export default function Instructions({ onNext, onBack, PID }) {
  const pages = [
    <InstPage1 />,
    <InstPage2 />,
    <InstPage3 />,
    <InstPage4 />,
    <InstPage5 />,
    <InstPage6 />,
    <InstPage8 />,
    <InstPage81 />,
  ];

  const [page, setPage] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [viewedPages, setViewedPages] = useState({}); // track pages already seen
  const firebase_uid = auth.currentUser?.uid;

  // Update Firestore with current instruction page
  const updateUserInstructionPage = async (currentPage) => {
    if (!firebase_uid) return;
    try {
      await setDoc(
        doc(db, "user", PID),
        { inst: currentPage },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to update instruction page:", err);
    }
  };

  // Called when moving forward
  const nextPage = () => {
    if (!canProceed) return; // prevent advancing before 3s on first view

    const next = page + 1;
    if (next < pages.length) {
      setPage(next);
      updateUserInstructionPage(next);
      setCanProceed(viewedPages[next]); // if next page seen before, allow immediate
    } else {
      onNext(); // Done
      updateUserInstructionPage(pages.length);
    }
  };

  const prevPage = () => {
    const prev = page - 1;
    if (prev >= 0) {
      setPage(prev);
      updateUserInstructionPage(prev);
      setCanProceed(true); // returning to previous page → allow immediate next
    } else {
      onBack();
      updateUserInstructionPage(0);
    }
  };

  // Set 3-second timer for first-time view
  useEffect(() => {
    if (viewedPages[page]) {
      // Already seen → allow next immediately
      setCanProceed(true);
      return;
    }

    setCanProceed(false);
    const timer = setTimeout(() => {
      setCanProceed(true);
      setViewedPages((prev) => ({ ...prev, [page]: true }));
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [page]);

  // Update Firestore on mount
  useEffect(() => {
    updateUserInstructionPage(page);
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>Instructions ({page + 1}/{pages.length})</h2>

      <div style={{ marginTop: 10, textAlign: "left" }}>
        {pages[page]}
      </div>

      <div style={{ marginTop: 30 }}>
        <button style={{ border: "1px solid gray" }} onClick={prevPage}>
          {page === 0 ? "Back" : "Previous"}
        </button>

        <button
          onClick={nextPage}
          style={{
            marginLeft: 10,
            border: "1px solid gray",
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
          disabled={!canProceed}
        >
          {page === pages.length - 1 ? "Finish Instructions" : "Next"}
        </button>
      </div>
    </div>
  );
}
