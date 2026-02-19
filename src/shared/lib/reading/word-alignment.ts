import { distance } from 'fastest-levenshtein';

import { normalizeWord } from './normalize-word';

export type WhisperWord = {
  word: string;
  start: number;
  end: number;
  confidence?: number;
};

/** Minimum Levenshtein similarity to align expected word to a spoken word. Tighter (0.5) reduces false matches when the user said something different. */
const MIN_SIMILARITY = 0.5;
const LOOKAHEAD = 3;

type MatchResult = { idx: number; similarity: number; conf: number };

function computeSimilarity(cleanExpected: string, cleanSpoken: string): number {
  const maxLen = Math.max(cleanExpected.length, cleanSpoken.length, 1);
  const lev = distance(cleanExpected, cleanSpoken);
  return 1 - lev / maxLen;
}

function isBetterMatch(
  candidate: MatchResult,
  current: MatchResult | null,
): boolean {
  if (current === null) return true;
  if (candidate.similarity > current.similarity) return true;
  if (
    candidate.similarity === current.similarity &&
    candidate.conf > current.conf
  ) {
    return true;
  }
  return false;
}

function findBestMatch(
  cleanExpected: string,
  spokenWords: WhisperWord[],
  startIdx: number,
): MatchResult | null {
  let best: MatchResult | null = null;
  const end = Math.min(startIdx + LOOKAHEAD, spokenWords.length);
  for (let k = startIdx; k < end; k++) {
    const spoken = spokenWords[k];
    const cleanSpoken = normalizeWord(spoken.word);
    if (!cleanSpoken) continue;
    const similarity = computeSimilarity(cleanExpected, cleanSpoken);
    if (similarity < MIN_SIMILARITY) continue;
    const conf =
      typeof spoken.confidence === 'number' ? spoken.confidence : 0.9;
    const candidate = { idx: k, similarity, conf };
    if (isBetterMatch(candidate, best)) best = candidate;
  }
  return best;
}

function createMissedEntry(): WhisperWord & { status: 'missed' } {
  return {
    word: '',
    start: 0,
    end: 0,
    confidence: 0,
    status: 'missed',
  };
}

/**
 * Align spoken words (from Whisper) to expected words.
 * For each expected word, search the next LOOKAHEAD spoken words for best match.
 * MIN_SIMILARITY = 0.5 so only reasonably close words align; else marked 'missed'.
 * If no match found, mark as 'missed'.
 */
export function alignWords(
  expectedWords: string[],
  spokenWords: WhisperWord[],
): Array<WhisperWord & { status?: 'missed' }> {
  const result: Array<WhisperWord & { status?: 'missed' }> = [];
  let spokenIdx = 0;

  for (const expected of expectedWords) {
    const cleanExpected = normalizeWord(expected);
    const bestMatch = findBestMatch(cleanExpected, spokenWords, spokenIdx);

    if (bestMatch === null) {
      result.push(createMissedEntry());
    } else {
      const spoken = spokenWords[bestMatch.idx];
      result.push({
        ...spoken,
        confidence: spoken.confidence ?? bestMatch.conf,
      });
      spokenIdx = bestMatch.idx + 1;
    }
  }

  return result;
}
