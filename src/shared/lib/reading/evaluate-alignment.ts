import { distance } from 'fastest-levenshtein';
import { normalizeForComparison } from './normalize-word';
import type { AlignedPair } from './sequence-alignment';

export type WordScoreStatus = 'green' | 'yellow' | 'red' | 'missed';

export type EvaluatedWord = {
  expected: string;
  spoken: string;
  status: WordScoreStatus;
  similarity: number;
  referenceIndex: number;
  transcribedIndex: number;
};

const CORRECT_SIMILARITY = 0.75;
const CLOSE_SIMILARITY = 0.5;

const HOMOPHONE_GROUPS: string[][] = [
  ['there', 'their', 'theyre'],
  ['your', 'youre'],
  ['its'], // it's and its normalize to same
  ['to', 'too', 'two'],
  ['no', 'know'],
  ['knew', 'new'],
  ['write', 'right'],
  ['hear', 'here'],
  ['wear', 'where'],
  ['sea', 'see'],
  ['buy', 'by', 'bye'],
  ['weather', 'whether'],
  ['flower', 'flour'],
  ['peace', 'piece'],
  ['weight', 'wait'],
  ['whole', 'hole'],
  ['would', 'wood'],
  ['through', 'threw'],
  ['night', 'knight'],
  ['sun', 'son'],
  ['won', 'one'],
  ['road', 'rode'],
  ['tail', 'tale'],
  ['plain', 'plane'],
  ['break', 'brake'],
  ['meet', 'meat'],
  ['steal', 'steel'],
  ['die', 'dye'],
  ['red', 'read'],
  ['made', 'maid'],
  ['pale', 'pail'],
  ['bear', 'bare'],
  ['fair', 'fare'],
  ['hair', 'hare'],
  ['pair', 'pear', 'pare'],
  ['stare', 'stair'],
  ['waist', 'waste'],
];

function levenshteinSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length, 1);
  const lev = distance(a, b);
  return 1 - lev / maxLen;
}

function areHomophones(a: string, b: string): boolean {
  const normA = normalizeForComparison(a);
  const normB = normalizeForComparison(b);
  return HOMOPHONE_GROUPS.some(
    (group) => group.includes(normA) && group.includes(normB),
  );
}

function evaluatePair(pair: AlignedPair, referenceWord: string): EvaluatedWord {
  const expected = normalizeForComparison(referenceWord);
  const actual = pair.transcribed
    ? normalizeForComparison(pair.transcribed)
    : '';

  if (!actual) {
    return {
      expected: referenceWord,
      spoken: '',
      status: 'missed',
      similarity: 0,
      referenceIndex: pair.referenceIndex,
      transcribedIndex: -1,
    };
  }

  const similarity = levenshteinSimilarity(expected, actual);
  const isExactMatch = expected === actual;
  const isHomophone = areHomophones(referenceWord, pair.transcribed ?? '');

  let status: WordScoreStatus;
  if (isExactMatch || isHomophone) {
    status = 'green';
  } else if (similarity >= CORRECT_SIMILARITY) {
    status = 'green';
  } else if (similarity >= CLOSE_SIMILARITY) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    expected: referenceWord,
    spoken: pair.transcribed ?? '',
    status,
    similarity,
    referenceIndex: pair.referenceIndex,
    transcribedIndex: pair.transcribedIndex,
  };
}

/**
 * Evaluate aligned pairs into one result per reference word.
 * Only pairs with reference !== null are scored (reference words).
 */
export function evaluateAlignment(
  alignedPairs: AlignedPair[],
  _referenceWords: string[],
): EvaluatedWord[] {
  const pairsForRef = alignedPairs
    .filter(
      (p): p is AlignedPair & { reference: string } => p.reference !== null,
    )
    .sort((a, b) => a.referenceIndex - b.referenceIndex);

  return pairsForRef.map((pair) =>
    evaluatePair(pair, pair.reference as string),
  );
}
