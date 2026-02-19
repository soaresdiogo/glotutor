'use client';

import { useState } from 'react';
import type { LessonExercise } from '@/client-api/native-lessons.api';
import type { ExerciseState } from '@/hooks/native-lessons/use-lesson-player';
import { useTranslate } from '@/locales';

type ReorderEx = Extract<LessonExercise, { type: 'REORDER' }>;

type Props = {
  exercise: ReorderEx;
  index: number;
  state: ExerciseState | undefined;
  useNativeDescription?: boolean;
  onAnswer: (index: number, answer: string[]) => void;
  onSubmit: (answer: string[]) => void;
  onRetry: () => void;
  disabled?: boolean;
};

export function ReorderExercise({
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
  const [selected, setSelected] = useState<string[]>([]);
  const remaining = exercise.words.filter((w) => !selected.includes(w));
  const isReviewing = state?.status === 'reviewing';
  const correct = state?.lastResult?.isCorrect;

  const toggle = (word: string) => {
    if (isReviewing) return;
    if (selected.includes(word)) {
      const next = selected.filter((w) => w !== word);
      setSelected(next);
      onAnswer(index, next);
    } else {
      const next = [...selected, word];
      setSelected(next);
      onAnswer(index, next);
    }
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-card) p-5">
      <p className="mb-3 font-medium text-(--text)">{exercise.prompt}</p>
      {useNativeDescription && exercise.prompt_native && (
        <p className="mb-2 text-xs text-(--text-dim)">
          — {exercise.prompt_native}
        </p>
      )}
      {exercise.scenario && (
        <>
          <p className="mb-3 rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm text-(--text-muted)">
            {exercise.scenario}
          </p>
          {useNativeDescription && exercise.scenario_native && (
            <p className="-mt-3 mb-3 text-xs text-(--text-dim)">
              — {exercise.scenario_native}
            </p>
          )}
        </>
      )}
      <div className="mb-3 flex min-h-[50px] flex-wrap gap-2 rounded-xl border-2 border-dashed border-(--border) bg-(--bg) p-3">
        {selected.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => toggle(w)}
            disabled={isReviewing}
            className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm font-medium hover:border-(--accent) disabled:cursor-default"
          >
            {w}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {remaining.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => toggle(w)}
            disabled={isReviewing}
            className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm font-medium hover:border-(--accent) hover:bg-(--accent-soft) disabled:cursor-default"
          >
            {w}
          </button>
        ))}
      </div>
      {!isReviewing && (
        <button
          type="button"
          onClick={() => onSubmit(selected)}
          disabled={disabled || selected.length === 0}
          className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Check
        </button>
      )}
      {isReviewing && (
        <div className="mt-4 space-y-3">
          <div
            className={`rounded-xl border p-4 text-sm ${
              correct
                ? 'border-(--green-border) bg-(--green-bg) text-(--green)'
                : 'border-(--red-border) bg-(--red-bg) text-(--red)'
            }`}
          >
            {correct ? '✓ Correct!' : '✗ Incorrect.'}
          </div>
          <button
            type="button"
            onClick={onRetry}
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
