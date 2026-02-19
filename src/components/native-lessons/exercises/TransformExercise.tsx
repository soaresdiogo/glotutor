'use client';

import { useEffect, useRef, useState } from 'react';
import type { LessonExercise } from '@/client-api/native-lessons.api';
import type {
  ExerciseResult,
  ExerciseState,
} from '@/hooks/native-lessons/use-lesson-player';
import { evaluateTransformPair } from '@/hooks/native-lessons/use-lesson-player';
import { useTranslate } from '@/locales';

type TransformEx = Extract<LessonExercise, { type: 'TRANSFORM' }>;

type Props = {
  exercise: TransformEx;
  index: number;
  state: ExerciseState | undefined;
  useNativeDescription?: boolean;
  onAnswer: (index: number, answer: string[]) => void;
  onSubmit: (answer: string[]) => void;
  onRetry: () => void;
  disabled?: boolean;
};

export function TransformExercise({
  exercise,
  index,
  state,
  useNativeDescription = false,
  onAnswer,
  onSubmit,
  onRetry,
  disabled,
}: Readonly<Props>) {
  const { t } = useTranslate();
  const [values, setValues] = useState<string[]>(
    exercise.pairs.map((_, i) => (state?.currentAnswer as string[])?.[i] ?? ''),
  );
  const [pairResults, setPairResults] = useState<(ExerciseResult | null)[]>(
    exercise.pairs.map(() => null),
  );
  const hasSubmittedWhenAllDone = useRef(false);
  const isReviewing = state?.status === 'reviewing';
  const lastResult = state?.lastResult;

  const setOne = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    setValues(next);
    onAnswer(index, next);
  };

  const handleCheckPair = (i: number) => {
    if (disabled || isReviewing) return;
    const ans = (values[i] ?? '').trim();
    if (!ans) return;
    const result = evaluateTransformPair(exercise.pairs[i], ans);
    setPairResults((prev) => {
      const next = [...prev];
      next[i] = result;
      return next;
    });
  };

  const allPairsChecked = pairResults.every((r) => r !== null);
  useEffect(() => {
    if (!allPairsChecked) {
      hasSubmittedWhenAllDone.current = false;
      return;
    }
    if (hasSubmittedWhenAllDone.current) return;
    hasSubmittedWhenAllDone.current = true;
    onAnswer(index, values);
    onSubmit(values);
  }, [allPairsChecked, index, values, onAnswer, onSubmit]);

  const handleRetry = () => {
    hasSubmittedWhenAllDone.current = false;
    setPairResults(exercise.pairs.map(() => null));
    setValues(exercise.pairs.map(() => ''));
    onRetry();
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-card) p-5">
      <p className="mb-4 font-medium text-(--text)">{exercise.prompt}</p>
      {useNativeDescription && exercise.prompt_native && (
        <p className="-mt-2 mb-4 text-xs text-(--text-dim)">
          — {exercise.prompt_native}
        </p>
      )}
      <div className="space-y-4">
        {exercise.pairs.map((pair, i) => (
          <div
            key={`${pair.textbook}-${pair.hint ?? ''}`}
            className="space-y-2"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,auto,1fr] sm:items-center">
              <div className="rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm text-(--text-muted)">
                {pair.textbook}
              </div>
              <span className="hidden text-(--text-dim) sm:inline">→</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={values[i] ?? ''}
                  onChange={(e) => setOne(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCheckPair(i);
                    }
                  }}
                  placeholder={pair.hint ?? 'Native version...'}
                  disabled={isReviewing}
                  className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm text-(--text) placeholder:text-(--text-dim) focus:border-(--accent) focus:outline-none"
                />
                {!isReviewing && (
                  <button
                    type="button"
                    onClick={() => handleCheckPair(i)}
                    disabled={disabled || !(values[i] ?? '').trim()}
                    className="shrink-0 rounded-lg border border-(--border) bg-(--bg-elevated) px-4 py-3 text-sm font-medium text-(--text) hover:bg-(--bg-card) disabled:opacity-50"
                  >
                    Check
                  </button>
                )}
              </div>
            </div>
            {pairResults[i] && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  pairResults[i]?.isCorrect
                    ? 'border-(--green-border) bg-(--green-bg) text-(--green)'
                    : 'border-(--red-border) bg-(--red-bg) text-(--red)'
                }`}
              >
                {pairResults[i]?.isCorrect ? '✓ Correct!' : '✗ Not quite.'}{' '}
                {pairResults[i]?.feedback}
                {!pairResults[i]?.isCorrect &&
                  pairResults[i]?.expectedAnswer && (
                    <p className="mt-1 text-(--text-muted)">
                      Expected: {pairResults[i]?.expectedAnswer}
                    </p>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>
      {isReviewing && allPairsChecked && lastResult && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-(--border) bg-(--bg-elevated) p-4 text-sm">
            <p className="font-medium text-(--text)">
              Overall: {lastResult.isCorrect ? '✓ Correct!' : '✗ Not quite.'}{' '}
              Score: {lastResult.score}/10
            </p>
            <p className="mt-2 text-(--text-muted)">{lastResult.feedback}</p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--bg-elevated) px-5 py-3 text-sm font-semibold text-(--text-muted) transition hover:bg-(--bg-card) hover:text-(--text)"
          >
            <span aria-hidden>↻</span>
            {t('reading.tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
}
