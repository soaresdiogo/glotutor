/**
 * Maximum number of conversation turns per CEFR level (cost control).
 * Only student-initiated turns count; the greeting does not.
 */
export const MAX_TURNS_BY_CEFR: Record<string, number> = {
  A1: 8,
  A2: 10,
  B1: 14,
  B2: 16,
  C1: 20,
  C2: 20,
};

export function getMaxTurnsForCefrLevel(cefrLevel: string): number {
  const level = cefrLevel.toUpperCase().slice(0, 2);
  return MAX_TURNS_BY_CEFR[level] ?? 10;
}
