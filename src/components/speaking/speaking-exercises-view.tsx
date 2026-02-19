'use client';

import { useState } from 'react';
import type { SpeakingExercise } from '@/client-api/speaking.api';
import { useSubmitExerciseAttempt } from '@/hooks/speaking';
import { useTranslate } from '@/locales';

type SpeakingExercisesViewProps = Readonly<{
  sessionId: string;
  exercises: SpeakingExercise[];
  onComplete: () => void;
}>;

/** Build answer for reorder_sentence: ordered words joined by space (e.g. "I wanna have a tea"). */
function getReorderAnswer(ordered: string[]): string {
  return ordered.join(' ').trim();
}

function ReorderSentenceInput({
  words,
  selected,
  onSelect,
  onRemove,
}: Readonly<{
  words: string[];
  selected: string[];
  onSelect: (word: string) => void;
  onRemove: (word: string) => void;
}>) {
  const remaining = words.filter((w) => !selected.includes(w));
  return (
    <div className="space-y-3">
      <div className="flex min-h-[44px] flex-wrap gap-2 rounded-lg border-2 border-dashed border-(--border) bg-(--bg) p-3">
        {selected.map((w) => (
          <button
            key={`${w}-${selected.indexOf(w)}`}
            type="button"
            onClick={() => onRemove(w)}
            className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm font-medium hover:border-(--accent)"
          >
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {remaining.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onSelect(w)}
            className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm font-medium hover:border-(--accent) hover:bg-(--accent-soft)"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SpeakingExercisesView({
  sessionId,
  exercises,
  onComplete,
}: SpeakingExercisesViewProps) {
  const { t } = useTranslate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  /** For reorder_sentence: selected order of words (indices or words). */
  const [reorderSelected, setReorderSelected] = useState<
    Record<string, string[]>
  >({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [hints, setHints] = useState<Record<string, string>>({});
  const submitAttempt = useSubmitExerciseAttempt();

  const exercise = exercises[currentIndex];
  const isLast = currentIndex >= exercises.length - 1;

  /** Current answer for display/submit: for reorder_sentence use built string from reorderSelected, else answers[id]. */
  const getCurrentAnswer = (
    ex: SpeakingExercise | undefined,
  ): string | undefined => {
    if (!ex) return undefined;
    if (ex.type === 'reorder_sentence') {
      const selected = reorderSelected[ex.id];
      return selected?.length ? getReorderAnswer(selected) : undefined;
    }
    return answers[ex.id];
  };

  const handleSubmit = async () => {
    if (!exercise) return;
    const answer = getCurrentAnswer(exercise);
    if (answer === undefined) return;
    try {
      const res = await submitAttempt.mutateAsync({
        sessionId,
        exerciseId: exercise.id,
        answer,
      });
      setResults((prev) => ({ ...prev, [exercise.id]: res.correct }));
      if (res.hint) {
        const hint = res.hint;
        setHints((prev) => ({ ...prev, [exercise.id]: hint }));
      }
      if (isLast) {
        onComplete();
      } else {
        setCurrentIndex((i) => i + 1);
      }
    } catch {
      // Error handled by mutation
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">{t('speaking.noExercises')}</p>
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white"
        >
          {t('speaking.viewResults')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <h2 className="text-xl font-medium text-(--text)">
        {t('speaking.fixationExercises', {
          current: currentIndex + 1,
          total: exercises.length,
        })}
      </h2>

      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
        <p className="mb-4 text-(--text)">{exercise?.questionText}</p>
        {exercise?.type === 'multiple_choice' &&
          Array.isArray(exercise.options) &&
          exercise.options.every((o) => typeof o === 'string') && (
            <ul className="space-y-2">
              {(exercise.options as readonly string[]).map((opt) => (
                <li key={opt}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name={`ex-${exercise.id}`}
                      value={opt}
                      checked={answers[exercise.id] === opt}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [exercise.id]: opt }))
                      }
                      className="rounded border-(--border)"
                    />
                    <span className="text-(--text-muted)">{opt}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        {exercise?.type === 'reorder_sentence' &&
          Array.isArray(exercise.options) &&
          exercise.options.every((o) => typeof o === 'string') && (
            <ReorderSentenceInput
              words={[...(exercise.options as readonly string[])]}
              selected={reorderSelected[exercise.id] ?? []}
              onSelect={(word) => {
                setReorderSelected((prev) => {
                  const current = prev[exercise.id] ?? [];
                  if (current.includes(word)) {
                    return {
                      ...prev,
                      [exercise.id]: current.filter((w) => w !== word),
                    };
                  }
                  return { ...prev, [exercise.id]: [...current, word] };
                });
              }}
              onRemove={(word) => {
                setReorderSelected((prev) => {
                  const current = prev[exercise.id] ?? [];
                  return {
                    ...prev,
                    [exercise.id]: current.filter((w) => w !== word),
                  };
                });
              }}
            />
          )}
        {(exercise?.type === 'fill_blank' ||
          (exercise?.type !== 'reorder_sentence' &&
            exercise?.type !== 'multiple_choice') ||
          (exercise?.type === 'multiple_choice' &&
            !Array.isArray(exercise?.options))) && (
          <input
            type="text"
            value={answers[exercise?.id ?? ''] ?? ''}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [exercise?.id ?? '']: e.target.value,
              }))
            }
            placeholder={t('speaking.yourAnswer')}
            className="w-full rounded-lg border border-(--border) bg-(--bg-elevated) px-4 py-2 text-(--text)"
          />
        )}
        {results[exercise?.id ?? ''] !== undefined && (
          <div className="mt-3 space-y-1">
            <p
              className={`text-sm ${
                results[exercise?.id ?? ''] ? 'text-(--green)' : 'text-(--red)'
              }`}
            >
              {results[exercise?.id ?? '']
                ? t('speaking.correct')
                : t('speaking.correctAnswer', {
                    answer: exercise?.correctAnswer ?? '',
                  })}
            </p>
            {hints[exercise?.id ?? ''] && (
              <p className="text-sm text-(--text-muted)">
                {hints[exercise.id]}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-lg border border-(--border) px-4 py-2 text-sm disabled:opacity-50"
        >
          {t('speaking.previous')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            getCurrentAnswer(exercise) === undefined || submitAttempt.isPending
          }
          className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isLast ? t('speaking.submitAndFinish') : t('speaking.submitAnswer')}
        </button>
      </div>
    </div>
  );
}
