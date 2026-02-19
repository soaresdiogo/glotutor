/**
 * Aggressive normalization for pronunciation comparison.
 * Handles Whisper variants: casing, punctuation, accents, leading/trailing apostrophes.
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9']/g, '')
    .replaceAll(/^'+|'+$/g, '')
    .trim();
}

/**
 * Same as normalizeWord; use when comparing reference to blind transcript.
 * Kept for clarity at call sites.
 */
export function normalizeForComparison(word: string): string {
  return normalizeWord(word);
}
