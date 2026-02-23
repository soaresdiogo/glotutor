/**
 * CEFR levels and placement test rules.
 *
 * Placement flow:
 * - Levels: A1 → A2 → B1 → B2 → C1 → C2 (ascending).
 * - Minimum questions per level before deciding: PLACEMENT_MIN_QUESTIONS_PER_LEVEL (3).
 * - If the student gets 3 correct in a row at a level (PLACEMENT_PERFECT_SCORE_TO_SKIP),
 *   they skip to the next level without answering more at the current level.
 * - After 3+ answers at a level: ≥70% correct (PLACEMENT_THRESHOLD_CORRECT_PERCENT)
 *   → move to next level; otherwise → recommend previous level and end.
 * - Maximum total questions: PLACEMENT_MAX_QUESTIONS (20).
 *
 * So: 3 questions per level minimum; 3/3 correct = skip to next level; need several
 * questions per level in the DB (e.g. 5+ per type) so the test can pick 3 without reuse.
 */
export const CEFR_LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type CefrLevel = (typeof CEFR_LEVEL_ORDER)[number];

/** Minimum answers at current level before we decide pass/fail (then ≥70% → next level). */
export const PLACEMENT_THRESHOLD_CORRECT_PERCENT = 70;
/** Questions per level before evaluating (e.g. 3 at A1, then decide). */
export const PLACEMENT_MIN_QUESTIONS_PER_LEVEL = 3;
/** If this many correct in a row at current level, skip to next level. */
export const PLACEMENT_PERFECT_SCORE_TO_SKIP = 3;
/** Cap total questions in one placement test. */
export const PLACEMENT_MAX_QUESTIONS = 20;

export function getNextLevel(current: string): string | null {
  const idx = CEFR_LEVEL_ORDER.indexOf(current as CefrLevel);
  if (idx < 0 || idx >= CEFR_LEVEL_ORDER.length - 1) return null;
  return CEFR_LEVEL_ORDER[idx + 1];
}

export function getPreviousLevel(current: string): string | null {
  const idx = CEFR_LEVEL_ORDER.indexOf(current as CefrLevel);
  if (idx <= 0) return null;
  return CEFR_LEVEL_ORDER[idx - 1];
}

export function isValidCefrLevel(level: string): level is CefrLevel {
  return CEFR_LEVEL_ORDER.includes(level as CefrLevel);
}
