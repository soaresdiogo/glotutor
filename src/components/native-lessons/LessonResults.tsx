'use client';

import Link from 'next/link';
import { useTranslate } from '@/locales';

type ExerciseResult = {
  exerciseIndex: number;
  type: string;
  correct: boolean;
  score?: number;
  userAnswer?: string | string[];
  correctAnswer?: string | string[];
  feedback?: string;
};

type Props = {
  lessonTitle: string;
  score: number | null;
  exerciseResults: ExerciseResult[];
};

export function LessonResults({ lessonTitle, score, exerciseResults }: Props) {
  const { t } = useTranslate();

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <Link
        href="/dashboard/native-lessons"
        className="inline-block text-sm text-(--text-muted) hover:text-(--text)"
      >
        ← {t('nativeLessons.backToList')}
      </Link>

      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <h2 className="text-2xl font-medium text-(--text)">{lessonTitle}</h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {t('nativeLessons.resultsSubtitle')}
        </p>
        {score != null && (
          <p
            className="mt-6 font-mono text-5xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {score}%
          </p>
        )}
      </div>

      {exerciseResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-(--text)">
            {t('nativeLessons.exerciseReview')}
          </h3>
          {exerciseResults.map((r) => (
            <div
              key={`${r.exerciseIndex}-${r.type}`}
              className={`rounded-xl border p-4 ${
                r.correct
                  ? 'border-(--green-border) bg-(--green-bg)'
                  : 'border-(--red-border) bg-(--red-bg)'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {t('nativeLessons.exercise')} {r.exerciseIndex + 1}
                </span>
                <span className="text-sm">
                  {r.correct ? '✓' : '✗'}{' '}
                  {r.score != null ? `${r.score}/10` : ''}
                </span>
              </div>
              {r.userAnswer != null && (
                <p className="mt-2 text-sm text-(--text-muted)">
                  {t('nativeLessons.yourAnswer')}:{' '}
                  {Array.isArray(r.userAnswer)
                    ? r.userAnswer.join(', ')
                    : r.userAnswer}
                </p>
              )}
              {r.feedback && <p className="mt-2 text-sm">{r.feedback}</p>}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/native-lessons"
        className="inline-block rounded-xl bg-(--accent) px-6 py-3 font-semibold text-white hover:opacity-90"
      >
        {t('nativeLessons.backToLessons')}
      </Link>
    </div>
  );
}
