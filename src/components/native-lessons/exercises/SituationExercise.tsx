'use client';

import { useState } from 'react';
import type { LessonExercise } from '@/client-api/native-lessons.api';
import type { ExerciseState } from '@/hooks/native-lessons/use-lesson-player';
import { useTranslate } from '@/locales';

type SituationEx = Extract<LessonExercise, { type: 'SITUATION' }>;

type Props = {
  exercise: SituationEx;
  index: number;
  state: ExerciseState | undefined;
  useNativeDescription?: boolean;
  onAnswer: (index: number, answer: string) => void;
  onSubmit: (answer: string) => void;
  onRetry: () => void;
  disabled?: boolean;
};

export function SituationExercise({
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
  const [value, setValue] = useState(
    (state?.currentAnswer as string | undefined) ?? '',
  );
  const isReviewing = state?.status === 'reviewing';
  const lastResult = state?.lastResult;
  const handleSubmit = () => {
    onAnswer(index, value);
    onSubmit(value);
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-card) p-5">
      <p className="mb-3 font-medium text-(--text)">{exercise.prompt}</p>
      {useNativeDescription && exercise.prompt_native && (
        <p className="mb-2 text-xs text-(--text-dim)">
          — {exercise.prompt_native}
        </p>
      )}
      <p className="mb-3 rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm text-(--text-muted)">
        {exercise.scenario}
      </p>
      {useNativeDescription && exercise.scenario_native && (
        <p className="-mt-3 mb-3 text-xs text-(--text-dim)">
          — {exercise.scenario_native}
        </p>
      )}
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onAnswer(index, e.target.value);
        }}
        placeholder={exercise.placeholder ?? 'Type your response...'}
        disabled={isReviewing}
        className="mb-4 w-full resize-none rounded-xl border border-(--border) bg-(--bg) px-4 py-3 text-(--text) placeholder:text-(--text-dim) focus:border-(--accent) focus:outline-none disabled:opacity-70"
        rows={4}
      />
      {!isReviewing && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Submit
        </button>
      )}
      {isReviewing && lastResult && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-(--border) bg-(--bg-elevated) p-4 text-sm">
            <p className="font-medium text-(--text)">
              {lastResult.isCorrect ? '✓ Correct!' : '✗ Not quite.'} Score:{' '}
              {lastResult.score}/10
            </p>
            <p className="mt-2 text-(--text-muted)">{lastResult.feedback}</p>
            {lastResult.expectedAnswer && (
              <p className="mt-2 text-(--accent)">
                Expected: {lastResult.expectedAnswer}
              </p>
            )}
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
