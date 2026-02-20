import { distance } from 'fastest-levenshtein';

import { normalizeForComparison } from './normalize-word';

export type AlignedPair = {
  reference: string | null;
  transcribed: string | null;
  referenceIndex: number;
  transcribedIndex: number;
};

const MATCH_SCORE = 2;
const GAP_PENALTY = -1;

function levenshteinSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length, 1);
  const lev = distance(a, b);
  return 1 - lev / maxLen;
}

type TraceDirection = 'diag' | 'up' | 'left';

function computeCell(
  score: number[][],
  referenceWords: string[],
  transcribedWords: string[],
  i: number,
  j: number,
): { value: number; direction: TraceDirection } {
  const refNorm = normalizeForComparison(referenceWords[i - 1]);
  const transNorm = normalizeForComparison(transcribedWords[j - 1]);
  const similarity = levenshteinSimilarity(refNorm, transNorm);
  const matchScore = similarity >= 0.5 ? MATCH_SCORE * similarity : GAP_PENALTY;
  const diag = score[i - 1][j - 1] + matchScore;
  const up = score[i - 1][j] + GAP_PENALTY;
  const left = score[i][j - 1] + GAP_PENALTY;
  if (diag >= up && diag >= left) return { value: diag, direction: 'diag' };
  if (up >= left) return { value: up, direction: 'up' };
  return { value: left, direction: 'left' };
}

function nextTracebackStep(
  i: number,
  j: number,
  traceback: string[][],
  referenceWords: string[],
  transcribedWords: string[],
): { pair: AlignedPair; nextI: number; nextJ: number } {
  if (i > 0 && j > 0 && traceback[i][j] === 'diag') {
    return {
      pair: {
        reference: referenceWords[i - 1],
        transcribed: transcribedWords[j - 1],
        referenceIndex: i - 1,
        transcribedIndex: j - 1,
      },
      nextI: i - 1,
      nextJ: j - 1,
    };
  }
  if (i > 0 && traceback[i][j] === 'up') {
    return {
      pair: {
        reference: referenceWords[i - 1],
        transcribed: null,
        referenceIndex: i - 1,
        transcribedIndex: -1,
      },
      nextI: i - 1,
      nextJ: j,
    };
  }
  return {
    pair: {
      reference: null,
      transcribed: transcribedWords[j - 1],
      referenceIndex: -1,
      transcribedIndex: j - 1,
    },
    nextI: i,
    nextJ: j - 1,
  };
}

/**
 * Needleman-Wunsch sequence alignment.
 * Aligns reference words (expected text) to transcribed words (blind Whisper output).
 * Handles insertions (extra spoken words) and deletions (skipped words).
 */
export function alignWordsNW(
  referenceWords: string[],
  transcribedWords: string[],
): AlignedPair[] {
  const m = referenceWords.length;
  const n = transcribedWords.length;

  const score: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  const traceback: string[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(''),
  );

  for (let i = 0; i <= m; i++) {
    score[i][0] = i * GAP_PENALTY;
    traceback[i][0] = 'up';
  }
  for (let j = 0; j <= n; j++) {
    score[0][j] = j * GAP_PENALTY;
    traceback[0][j] = 'left';
  }
  traceback[0][0] = 'done';

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cell = computeCell(score, referenceWords, transcribedWords, i, j);
      score[i][j] = cell.value;
      traceback[i][j] = cell.direction;
    }
  }

  const aligned: AlignedPair[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    const step = nextTracebackStep(
      i,
      j,
      traceback,
      referenceWords,
      transcribedWords,
    );
    aligned.unshift(step.pair);
    i = step.nextI;
    j = step.nextJ;
  }

  return aligned;
}
