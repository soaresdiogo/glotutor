'use client';

import type { LessonExercise } from '@/client-api/native-lessons.api';
import type { ExerciseState } from '@/hooks/native-lessons/use-lesson-player';
import { useTranslate } from '@/locales';

type ChoiceEx = Extract<LessonExercise, { type: 'CHOICE' }>;

type Props = {
  exercise: ChoiceEx;
  index: number;
  state: ExerciseState | undefined;
  useNativeDescription?: boolean;
  onAnswer: (index: number, answer: string) => void;
  onSubmit: (answer: string) => void;
  onRetry: () => void;
  disabled?: boolean;
};

const LETTERS = ['A', 'B', 'C', 'D'];

export function ChoiceExercise({
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
  const selected = state?.currentAnswer as string | undefined;
  const isReviewing = state?.status === 'reviewing';
  const correct = state?.lastResult?.isCorrect;
  const handleSelect = (text: string) => {
    if (isReviewing || disabled) return;
    onAnswer(index, text);
    onSubmit(text);
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-card) p-5">
      <p className="mb-3 font-medium text-(--text)">{exercise.prompt}</p>
      {useNativeDescription && exercise.prompt_native && (
        <p className="mb-2 text-xs text-(--text-dim)">
          — {exercise.prompt_native}
        </p>
      )}
      <p className="mb-4 rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm text-(--text-muted)">
        {exercise.scenario}
      </p>
      {useNativeDescription && exercise.scenario_native && (
        <p className="-mt-3 mb-4 text-xs text-(--text-dim)">
          — {exercise.scenario_native}
        </p>
      )}
      <ul className="space-y-2">
        {exercise.options.map((opt, i) => {
          const isSelected = selected === opt.text;
          const showCorrect = isReviewing && opt.correct;
          const showWrong = isReviewing && isSelected && !opt.correct;
          let optionButtonClass: string;
          if (showCorrect) {
            optionButtonClass =
              'border-(--green-border) bg-(--green-bg) text-(--green)';
          } else if (showWrong) {
            optionButtonClass =
              'border-(--red-border) bg-(--red-bg) text-(--red)';
          } else if (isSelected) {
            optionButtonClass = 'border-(--accent) bg-(--accent-soft)';
          } else {
            optionButtonClass =
              'border-(--border) bg-(--bg) hover:border-(--border-light)';
          }
          return (
            <li key={opt.text}>
              <button
                type="button"
                onClick={() => handleSelect(opt.text)}
                disabled={isReviewing}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${optionButtonClass}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-(--border) font-mono text-xs font-semibold">
                  {LETTERS[i]}
                </span>
                {opt.text}
              </button>
            </li>
          );
        })}
      </ul>
      {isReviewing && (
        <div className="mt-4 space-y-3">
          <div
            className={`rounded-xl border p-3 text-sm ${
              correct
                ? 'border-(--green-border) bg-(--green-bg) text-(--green)'
                : 'border-(--red-border) bg-(--red-bg) text-(--red)'
            }`}
          >
            {correct ? '✓ Correct!' : '✗ Incorrect.'}
            {!correct && state?.lastResult?.expectedAnswer && (
              <p className="mt-2 text-(--text-muted)">
                Correct answer: {state.lastResult.expectedAnswer}
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
