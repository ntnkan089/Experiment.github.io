import {
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  increment,
  orderBy,
  limit,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firestore";

/**
 * Assigns 10 difficulty-check problems to a user on-the-fly.
 * Each problem is assigned to max 5 users.
 *
 */
export async function assignDifficultyProblems(firebase_uid) {
  const userProblemsRef = collection(
    db,
    `users/${firebase_uid}/experiment/difficulty-check/problems`
  );

  // 1. Already assigned?
  const existingSnap = await getDocs(userProblemsRef);
  if (existingSnap.size === 10) {
    return existingSnap.docs.map(d => d.id);
  }

  const assigned = [];

  while (assigned.length < 10) {
    await runTransaction(db, async (tx) => {
      const q = query(
        collection(db, "difficultyProblems"),
        where("slotsUsed", "<", 5),
        orderBy("slotsUsed", "asc"),
        limit(1)
      );

      const snap = await tx.get(q);
      if (snap.empty) throw new Error("Experiment full");

      const slotDoc = snap.docs[0];
      const problemId = slotDoc.id;

      // Prevent duplicate assignment on retries
      if (assigned.includes(problemId)) return;

      tx.set(
        doc(
          db,
          `users/${firebase_uid}/experiment/difficulty-check/problems/${problemId}`
        ),
        {
          problemId,
          assignedAt: serverTimestamp(),
          completed: false
        }
      );

      tx.update(slotDoc.ref, {
        slotsUsed: increment(1)
      });

      assigned.push(problemId);
    });
  }

  return assigned;
}
