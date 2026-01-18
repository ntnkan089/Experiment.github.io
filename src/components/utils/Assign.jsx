/**
 * Assigns 10 difficulty-check problems to a user on-the-fly.
 * Each problem is assigned to max 5 users.
 *
 */
export function shuffleArray(arr) {
  const a = [...arr]; // copy
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
