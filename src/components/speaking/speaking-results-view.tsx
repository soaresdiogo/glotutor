'use client';

import Link from 'next/link';
import { useState } from 'react';
import type {
  SessionResults,
  SpeakingFeedback,
} from '@/client-api/speaking.api';
import { useTranslate } from '@/locales';

type SpeakingResultsViewProps = Readonly<{
  results: SessionResults;
  /** When set, "Practice again" is a button that calls this instead of linking to topic. */
  onPracticeAgain?: () => void;
}>;

function formatAttemptAnswer(
  answer: string | string[] | Record<string, string> | null,
): string {
  if (answer == null) return '—';
  if (typeof answer === 'string') return answer;
  if (Array.isArray(answer)) return answer.join(', ');
  return Object.entries(answer)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

export function SpeakingResultsView({
  results,
  onPracticeAgain,
}: SpeakingResultsViewProps) {
  const { t } = useTranslate();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const { topicSlug, feedback, exerciseScore, exercises } = results;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <header className="text-center">
        <h1 className="text-2xl font-medium text-(--text)">
          {t('speaking.results')}
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          {results.topicTitle} · {results.cefrLevel}
        </p>
        <p className="mt-2 text-sm text-(--text-muted)">
          {t('speaking.exercisesCorrect', {
            correct: exerciseScore.correct,
            total: exerciseScore.total,
          })}
        </p>
      </header>

      {feedback && (
        <section className="rounded-xl border border-(--border) bg-(--bg-card) overflow-hidden">
          <button
            type="button"
            onClick={() => setDetailsExpanded((v) => !v)}
            className="flex w-full items-center justify-between p-6 text-left transition hover:bg-(--bg-hover)"
            aria-expanded={detailsExpanded}
          >
            <div>
              <h2 className="text-lg font-medium text-(--text)">
                {t('speaking.feedbackSummary')}
              </h2>
              <p className="mt-1 text-sm text-(--text-muted)">
                {feedback.encouragement_message}
              </p>
              <p className="mt-2 text-sm text-(--text-muted)">
                {t('speaking.score', { score: feedback.overall_score })}
              </p>
            </div>
            <span
              className="ml-4 shrink-0 text-(--text-muted) transition-transform"
              aria-hidden
            >
              {detailsExpanded ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <title>Collapse</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <title>Expand</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </span>
          </button>
          {detailsExpanded && (
            <div className="border-t border-(--border) p-6 pt-4 space-y-6">
              <FullFeedbackContent feedback={feedback} t={t} />
              {exercises.length > 0 && (
                <ExercisesSolvedContent exercises={exercises} t={t} />
              )}
            </div>
          )}
        </section>
      )}

      {feedback == null && exercises.length > 0 && (
        <section className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
          <ExercisesSolvedContent exercises={exercises} t={t} />
        </section>
      )}

      <div className="flex justify-center gap-4">
        {onPracticeAgain ? (
          <button
            type="button"
            onClick={onPracticeAgain}
            className="rounded-xl bg-(--accent) px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            {t('speaking.practiceAgain')}
          </button>
        ) : (
          <Link
            href={`/dashboard/speaking/${topicSlug}`}
            className="rounded-xl bg-(--accent) px-6 py-3 font-medium text-white no-underline transition hover:opacity-90"
          >
            {t('speaking.practiceAgain')}
          </Link>
        )}
        <Link
          href="/dashboard/speaking"
          className="rounded-xl border border-(--border) px-6 py-3 font-medium text-(--text) no-underline transition hover:bg-(--bg-hover)"
        >
          {t('speaking.backToTopics')}
        </Link>
      </div>
    </div>
  );
}

function FullFeedbackContent({
  feedback,
  t,
}: Readonly<{
  feedback: SpeakingFeedback;
  t: (key: string, params?: Record<string, string | number>) => string;
}>) {
  return (
    <div className="space-y-6">
      {feedback.strengths.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-(--text)">
            {t('speaking.strengths')}
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-(--text-muted)">
            {feedback.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.grammar_errors.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-(--text)">
            {t('speaking.corrections')}
          </h3>
          <ul className="space-y-3">
            {feedback.grammar_errors.map((e) => (
              <li
                key={`${e.what_student_said}|${e.correction}`}
                className="rounded-lg border-l-4 border-(--yellow) bg-(--bg-elevated) p-3"
              >
                <span className="line-through text-(--red)">
                  {e.what_student_said}
                </span>
                <span className="ml-2 text-(--green)">{e.correction}</span>
                <p className="mt-1 text-xs text-(--text-dim)">
                  {e.explanation}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.pronunciation_notes.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-(--text)">
            {t('speaking.pronunciationNotes')}
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-(--text-muted)">
            {feedback.pronunciation_notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.vocabulary_used.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-(--text)">
            {t('speaking.vocabularyUsed')}
          </h3>
          <ul className="space-y-2 text-sm text-(--text-muted)">
            {feedback.vocabulary_used.map((v) => (
              <li key={`${v.word}-${v.context}`}>
                <span className="font-medium text-(--text)">{v.word}</span>
                {v.context && ` — ${v.context}`}
                {v.is_native_expression && (
                  <span className="ml-1 text-(--accent)">★</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.improvement_suggestions.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-(--text)">
            {t('speaking.suggestions')}
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-(--text-muted)">
            {feedback.improvement_suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type ExerciseWithAttempt = SessionResults['exercises'][number];

function ExercisesSolvedContent({
  exercises,
  t,
}: Readonly<{
  exercises: ExerciseWithAttempt[];
  t: (key: string, params?: Record<string, string | number>) => string;
}>) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-(--text)">
        {t('speaking.fixationExercises', {
          current: exercises.length,
          total: exercises.length,
        })}
      </h3>
      <ul className="space-y-4">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            className="rounded-xl border border-(--border) bg-(--bg-elevated) p-4"
          >
            <p className="mb-2 font-medium text-(--text)">{ex.questionText}</p>
            {ex.attempt && (
              <p className="text-sm text-(--text-muted)">
                {t('speaking.yourAnswer')}:{' '}
                {formatAttemptAnswer(ex.attempt.answer)}{' '}
                {ex.attempt.isCorrect ? (
                  <span className="text-(--green)">
                    ✓ {t('speaking.correct')}
                  </span>
                ) : (
                  <span className="text-(--red)">✗</span>
                )}
              </p>
            )}
            <p className="mt-1 text-sm text-(--text-muted)">
              {t('speaking.correctAnswer', {
                answer: ex.correctAnswer,
              })}
            </p>
            {ex.explanationText && (
              <p className="mt-2 text-xs text-(--text-dim)">
                {ex.explanationText}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
