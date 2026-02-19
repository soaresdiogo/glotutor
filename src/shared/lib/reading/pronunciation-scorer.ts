import { distance } from 'fastest-levenshtein';

import { normalizeWord } from './normalize-word';

export type WordScoreStatus = 'green' | 'yellow' | 'red' | 'missed';

export type WordScoreResult = {
  status: WordScoreStatus;
  similarity: number;
  confidence: number;
  phoneticMatch: boolean;
  combinedScore: number;
};

export type SpokenWord = {
  word: string;
  confidence: number;
  status?: 'missed';
};

/** Similarity ≥ this = yellow (close). Below = red (incorrect). */
const YELLOW_SIMILARITY_THRESHOLD = 0.6;

/**
 * Blind comparison: status is based only on what was actually said vs expected.
 * - Green: exact match (normalized).
 * - Yellow: similarity ≥ 0.6 (close but not perfect).
 * - Red: similarity < 0.6 or wrong word.
 * - Missed: word not said.
 * Whisper confidence and phonetic match are not used for status (blind transcription).
 */
function getStatusFromScore(
  similarity: number,
  isMissed: boolean,
): WordScoreStatus {
  if (isMissed) return 'missed';
  if (similarity >= 1) return 'green';
  if (similarity >= YELLOW_SIMILARITY_THRESHOLD) return 'yellow';
  return 'red';
}

/**
 * Levenshtein similarity in [0, 1]. 1 = exact match.
 */
function levenshteinSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length, 1);
  const lev = distance(a, b);
  return 1 - lev / maxLen;
}

/**
 * Score one word: compare expected (reference) to what was said (blind transcript).
 * Status uses only similarity thresholds; no reference text is sent to Whisper.
 */
export function scoreWord(
  expectedWord: string,
  spoken: SpokenWord,
): WordScoreResult {
  const compareExpected = normalizeWord(expectedWord).replaceAll("'", '');
  const cleanSpoken = (spoken.word ?? '')
    .replaceAll(/[^a-zA-Z'-]/g, '')
    .toLowerCase()
    .replaceAll("'", '')
    .trim();

  const isMissed = spoken.status === 'missed' || !cleanSpoken;

  if (isMissed) {
    return {
      status: 'missed',
      similarity: 0,
      confidence: spoken.confidence,
      phoneticMatch: false,
      combinedScore: 0,
    };
  }

  const similarity = levenshteinSimilarity(compareExpected, cleanSpoken);
  const status = getStatusFromScore(similarity, false);
  const combinedScore = similarity;

  return {
    status,
    similarity,
    confidence: spoken.confidence,
    phoneticMatch: similarity >= 1,
    combinedScore,
  };
}
