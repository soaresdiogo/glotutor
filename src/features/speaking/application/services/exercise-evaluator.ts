import { distance } from 'fastest-levenshtein';

import type { SpeakingExerciseType } from '@/features/speaking/domain/entities/speaking-exercise.entity';

export type ExerciseEvaluationResult = {
  correct: boolean;
  hint?: string;
};

/** Accepted shapes for correct_answer in DB: string or JSON with primary + alternatives */
type CorrectAnswerInput = string | { primary: string; alternatives?: string[] };

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "i've": 'i have',
  "i'll": 'i will',
  "i'd": 'i would',
  "you're": 'you are',
  "you've": 'you have',
  "you'll": 'you will',
  "you'd": 'you would',
  "he's": 'he is',
  "he'll": 'he will',
  "he'd": 'he would',
  "she's": 'she is',
  "she'll": 'she will',
  "she'd": 'she would',
  "it's": 'it is',
  "it'll": 'it will',
  "it'd": 'it would',
  "we're": 'we are',
  "we've": 'we have',
  "we'll": 'we will',
  "we'd": 'we would',
  "they're": 'they are',
  "they've": 'they have',
  "they'll": 'they will',
  "they'd": 'they would',
  "that's": 'that is',
  "that'll": 'that will',
  "who's": 'who is',
  "who'll": 'who will',
  "who'd": 'who would',
  "what's": 'what is',
  "what're": 'what are',
  "what'll": 'what will',
  "what'd": 'what would',
  "where's": 'where is',
  "where'd": 'where did',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "shouldn't": 'should not',
  "couldn't": 'could not',
  "can't": 'cannot',
  cannot: 'can not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "hasn't": 'has not',
  "haven't": 'have not',
  "hadn't": 'had not',
  "mustn't": 'must not',
  "let's": 'let us',
  "there's": 'there is',
  "there're": 'there are',
  "here's": 'here is',
};

const TRAILING_PUNCTUATION = /[.,;:!?'"]+$/;

function normalizeForComparison(s: string): string {
  let t = s
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, ' ')
    .replace(TRAILING_PUNCTUATION, '');
  // Expand common contractions so "I've" matches "I have"
  for (const [contraction, expanded] of Object.entries(CONTRACTIONS)) {
    const re = new RegExp(
      String.raw`\b${contraction.replaceAll("'", "'")}\b`,
      'gi',
    );
    t = t.replaceAll(re, expanded);
  }
  return t.trim();
}

function parseCorrectAnswer(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as CorrectAnswerInput;
    if (typeof parsed === 'object' && parsed !== null && 'primary' in parsed) {
      const list = [parsed.primary, ...(parsed.alternatives ?? [])];
      return list.filter((x): x is string => typeof x === 'string');
    }
  } catch {
    // not JSON
  }
  return [trimmed];
}

/** Levenshtein similarity in [0, 1]. 1 = exact match. */
function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length, 1);
  return 1 - distance(a, b) / maxLen;
}

/** True if user answer is close (e.g. typo) to one of the accepted answers. */
function isCloseButWrong(
  normalizedUser: string,
  acceptedNormalized: string[],
  typoThreshold = 0.85,
): boolean {
  for (const accepted of acceptedNormalized) {
    if (similarity(normalizedUser, accepted) >= typoThreshold) return true;
  }
  return false;
}

function evaluateTextAnswer(
  userAnswer: string,
  correctAnswerRaw: string,
): ExerciseEvaluationResult {
  const accepted = parseCorrectAnswer(correctAnswerRaw);
  if (accepted.length === 0) return { correct: false };
  const normalizedAccepted = accepted.map(normalizeForComparison);
  const normalizedUser = normalizeForComparison(userAnswer);

  for (const a of normalizedAccepted) {
    if (normalizedUser === a) return { correct: true };
  }
  if (isCloseButWrong(normalizedUser, normalizedAccepted)) {
    return { correct: false, hint: 'Almost! Check your spelling.' };
  }
  return { correct: false };
}

function evaluateMultipleChoice(
  userAnswer: string,
  correctAnswerRaw: string,
): ExerciseEvaluationResult {
  const normalizedCorrect = normalizeForComparison(correctAnswerRaw);
  const normalizedUser = normalizeForComparison(userAnswer);
  return { correct: normalizedUser === normalizedCorrect };
}

function evaluateReorderSentence(
  userAnswer: string | string[],
  correctAnswerRaw: string,
): ExerciseEvaluationResult {
  const accepted = parseCorrectAnswer(correctAnswerRaw);
  const normalizedAccepted = accepted.map(normalizeForComparison);
  const userStr = Array.isArray(userAnswer)
    ? userAnswer.join(' ').trim()
    : String(userAnswer).trim();
  const normalizedUser = normalizeForComparison(userStr);

  for (const a of normalizedAccepted) {
    if (normalizedUser === a) return { correct: true };
  }
  if (isCloseButWrong(normalizedUser, normalizedAccepted)) {
    return { correct: false, hint: 'Almost! Check your spelling.' };
  }
  return { correct: false };
}

function normalizeMatchPairs(pairs: Record<string, string>): string {
  return Object.entries(pairs)
    .map(
      ([k, v]) => `${normalizeForComparison(k)}:${normalizeForComparison(v)}`,
    )
    .sort((a, b) => a.localeCompare(b))
    .join(',');
}

function parseMatchAnswer(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return '';
  const pairs = trimmed.split(',').map((p) => {
    const idx = p.indexOf(':');
    const k = idx >= 0 ? p.slice(0, idx).trim() : '';
    const v = idx >= 0 ? p.slice(idx + 1).trim() : p.trim();
    return [k, v] as const;
  });
  const obj = Object.fromEntries(pairs);
  return normalizeMatchPairs(obj);
}

function evaluateMatchExpression(
  userAnswer: Record<string, string>,
  correctAnswerRaw: string,
): ExerciseEvaluationResult {
  const accepted = parseCorrectAnswer(correctAnswerRaw);
  const normalizedAccepted = accepted.map(parseMatchAnswer);
  const normalizedUser = normalizeMatchPairs(userAnswer);

  for (const a of normalizedAccepted) {
    if (normalizedUser === a) return { correct: true };
  }
  return { correct: false };
}

export function evaluateExercise(
  exerciseType: SpeakingExerciseType,
  correctAnswerRaw: string,
  userAnswer: string | string[] | Record<string, string>,
): ExerciseEvaluationResult {
  switch (exerciseType) {
    case 'fill_blank':
      return evaluateTextAnswer(
        typeof userAnswer === 'string' ? userAnswer : String(userAnswer),
        correctAnswerRaw,
      );
    case 'multiple_choice':
      return evaluateMultipleChoice(
        typeof userAnswer === 'string' ? userAnswer : String(userAnswer),
        correctAnswerRaw,
      );
    case 'reorder_sentence':
      return typeof userAnswer === 'object' &&
        userAnswer !== null &&
        !Array.isArray(userAnswer)
        ? { correct: false }
        : evaluateReorderSentence(userAnswer, correctAnswerRaw);
    case 'match_expression':
      return evaluateMatchExpression(
        typeof userAnswer === 'object' &&
          userAnswer !== null &&
          !Array.isArray(userAnswer)
          ? userAnswer
          : {},
        correctAnswerRaw,
      );
    default:
      return evaluateTextAnswer(
        typeof userAnswer === 'string'
          ? userAnswer
          : JSON.stringify(userAnswer),
        correctAnswerRaw,
      );
  }
}
