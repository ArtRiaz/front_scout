/**
 * Local persistence for the penalty mini-game.
 *
 * Pilot scope: the best score is kept in localStorage only (no backend).
 * Swapping this for a server leaderboard later means changing just these two
 * functions.
 */
const BEST_SCORE_KEY = "penalty_best_score_v1";

export function getBestScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Persist `score` if it beats the stored best.
 * Returns the resulting best score and whether it was a new record.
 */
export function saveBestScore(score: number): { best: number; isRecord: boolean } {
  const previous = getBestScore();
  if (score <= previous) return { best: previous, isRecord: false };
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
    }
  } catch {
    /* storage unavailable (private mode) — non-fatal for the game */
  }
  return { best: score, isRecord: true };
}
