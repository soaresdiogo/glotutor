/** CEFR levels in ascending order for adaptive placement logic */
export const CEFR_LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type CefrLevel = (typeof CEFR_LEVEL_ORDER)[number];

export const PLACEMENT_THRESHOLD_CORRECT_PERCENT = 70;
export const PLACEMENT_MIN_QUESTIONS_PER_LEVEL = 3;
export const PLACEMENT_PERFECT_SCORE_TO_SKIP = 3;
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
