'use client';

import { useMemo, useState } from 'react';
import type { LessonExercise } from '@/client-api/native-lessons.api';
import type { ExerciseState } from '@/hooks/native-lessons/use-lesson-player';
import { useTranslate } from '@/locales';

type MatchEx = Extract<LessonExercise, { type: 'MATCH' }>;
type Pair = { situation: string; chunk: string };

/** Fisher–Yates shuffle; returns new array. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Props = {
  exercise: MatchEx;
  index: number;
  state: ExerciseState | undefined;
  useNativeDescription?: boolean;
  onAnswer: (index: number, answer: string[]) => void;
  onSubmit: (answer: string[]) => void;
  onRetry: () => void;
  disabled?: boolean;
};

export function MatchExercise({
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
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [wrongFlash, setWrongFlash] = useState<Pair | null>(null);
  const remainingSituations = exercise.pairs.filter(
    (p) => !pairs.some((x) => x.situation === p.situation),
  );
  const remainingChunks = exercise.pairs.filter(
    (p) => !pairs.some((x) => x.chunk === p.chunk),
  );
  /** Shuffled order for the right column so chunks are not aligned with situations. */
  const shuffledChunkOrder = useMemo(
    () => shuffle(exercise.pairs.map((p) => p.chunk)),
    [exercise.pairs],
  );
  const remainingChunksInShuffledOrder = useMemo(
    () =>
      [...remainingChunks].sort(
        (a, b) =>
          shuffledChunkOrder.indexOf(a.chunk) -
          shuffledChunkOrder.indexOf(b.chunk),
      ),
    [remainingChunks, shuffledChunkOrder],
  );
  const isReviewing = state?.status === 'reviewing';

  const selectSituation = (situation: string) => {
    if (isReviewing) return;
    if (leftSelected !== null) return;
    const i = exercise.pairs.findIndex((p) => p.situation === situation);
    setLeftSelected(i);
  };

  const selectChunk = (chunk: string) => {
    if (isReviewing || leftSelected === null) return;
    const situation = exercise.pairs[leftSelected]?.situation;
    if (!situation) return;
    const isCorrectPair = exercise.pairs.some(
      (p) => p.situation === situation && p.chunk === chunk,
    );
    if (!isCorrectPair) {
      setWrongFlash({ situation, chunk });
      setLeftSelected(null);
      setTimeout(() => setWrongFlash(null), 800);
      return;
    }
    const newPairs = [...pairs, { situation, chunk }];
    setPairs(newPairs);
    setLeftSelected(null);
    onAnswer(
      index,
      newPairs.map((x) => `${x.situation}|${x.chunk}`),
    );
  };

  const unpair = (pair: Pair) => {
    if (isReviewing) return;
    setLeftSelected(null);
    const newPairs = pairs.filter(
      (p) => !(p.situation === pair.situation && p.chunk === pair.chunk),
    );
    setPairs(newPairs);
    onAnswer(
      index,
      newPairs.map((x) => `${x.situation}|${x.chunk}`),
    );
  };

  const resetAll = () => {
    if (isReviewing) return;
    setLeftSelected(null);
    setPairs([]);
    onAnswer(index, []);
  };

  const handleSubmit = () => {
    onSubmit(pairs.map((pr) => `${pr.situation}|${pr.chunk}`));
  };

  const handleRetry = () => {
    setLeftSelected(null);
    setPairs([]);
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-(--text-dim)">
            Situation
          </p>
          <ul className="space-y-2">
            {remainingSituations.map((p) => {
              const isWrong = wrongFlash?.situation === p.situation;
              const isSelected =
                leftSelected !== null &&
                exercise.pairs[leftSelected]?.situation === p.situation;
              let situationButtonClass: string;
              if (isWrong) {
                situationButtonClass =
                  'border-(--red-border) bg-(--red-bg) text-(--red)';
              } else if (isSelected) {
                situationButtonClass = 'border-(--accent) bg-(--accent-soft)';
              } else {
                situationButtonClass =
                  'border-(--border) bg-(--bg) hover:border-(--border-light)';
              }
              return (
                <li key={`${p.situation}-${p.chunk}`}>
                  <button
                    type="button"
                    onClick={() => selectSituation(p.situation)}
                    disabled={isReviewing}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${situationButtonClass}`}
                  >
                    {p.situation}
                  </button>
                </li>
              );
            })}
            {pairs.map((pr) => (
              <li key={`${pr.situation}-${pr.chunk}`}>
                <button
                  type="button"
                  onClick={() => unpair(pr)}
                  disabled={isReviewing}
                  className="w-full rounded-lg border border-(--green-border) bg-(--green-bg) px-3 py-2 text-left text-sm text-(--green) hover:opacity-90"
                >
                  {pr.situation} → {pr.chunk}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-(--text-dim)">
            Chunk
          </p>
          <ul className="space-y-2">
            {remainingChunksInShuffledOrder.map((p) => {
              const isWrong = wrongFlash?.chunk === p.chunk;
              return (
                <li key={`${p.situation}-${p.chunk}`}>
                  <button
                    type="button"
                    onClick={() => selectChunk(p.chunk)}
                    disabled={isReviewing || leftSelected === null}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      isWrong
                        ? 'border-(--red-border) bg-(--red-bg) text-(--red)'
                        : 'border-(--border) bg-(--bg) hover:border-(--border-light) disabled:opacity-50'
                    }`}
                  >
                    {p.chunk}
                  </button>
                </li>
              );
            })}
            {pairs.map((pr) => (
              <li key={`${pr.chunk}-${pr.situation}`}>
                <button
                  type="button"
                  onClick={() => unpair(pr)}
                  disabled={isReviewing}
                  className="w-full rounded-lg border border-(--green-border) bg-(--green-bg) px-3 py-2 text-left text-sm text-(--green) hover:opacity-90"
                >
                  {pr.chunk}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {!isReviewing && (pairs.length > 0 || leftSelected !== null) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm font-medium text-(--text-muted) hover:bg-(--bg-card) hover:text-(--text)"
          >
            Reset All
          </button>
          {pairs.length === exercise.pairs.length && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled}
              className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Check
            </button>
          )}
        </div>
      )}
      {isReviewing && (
        <div className="mt-4 space-y-3">
          <div
            className={`rounded-xl border p-3 text-sm ${
              state?.lastResult?.isCorrect
                ? 'border-(--green-border) bg-(--green-bg) text-(--green)'
                : 'border-(--red-border) bg-(--red-bg) text-(--red)'
            }`}
          >
            {state?.lastResult?.isCorrect ? '✓ Correct!' : '✗ Incorrect.'}
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
