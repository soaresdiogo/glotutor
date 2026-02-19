'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useExerciseResults } from '@/hooks/listening/use-exercise-results';
import { useTranslate } from '@/locales';

export default function ExerciseResultsPage() {
  const params = useParams();
  const podcastId = params.podcastId as string;
  const { t } = useTranslate();
  const { data: results, isPending, isError } = useExerciseResults(podcastId);

  if (isPending) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </main>
    );
  }

  if (isError || !results) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">
          {t('listening.errorLoadingPodcasts')}
        </p>
        <Link
          href="/dashboard/listening"
          className="mt-4 inline-block text-(--accent)"
        >
          {t('listening.results.backToList')}
        </Link>
      </main>
    );
  }

  const perQuestion = results.exerciseFeedback?.perQuestion ?? [];
  const totalQuestions = results.totalQuestions ?? (perQuestion.length || 1);

  return (
    <main className="p-6 md:p-8">
      <Link
        href="/dashboard/listening"
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← {t('listening.results.backToList')}
      </Link>
      <h1 className="text-2xl font-medium text-(--text)">
        {t('listening.results.title')}
      </h1>
      <p className="mt-1 text-sm text-(--text-muted)">{results.podcastTitle}</p>
      <div className="mt-6 rounded-xl border border-(--border) bg-(--bg-card) p-4">
        <p className="text-lg font-medium text-(--text)">
          {t('listening.results.scoreLabel')}: {results.exerciseScore}/
          {totalQuestions}
        </p>
        {results.exerciseFeedback?.overallFeedback && (
          <p className="mt-2 text-sm text-(--text-muted)">
            {results.exerciseFeedback.overallFeedback}
          </p>
        )}
      </div>
      <ul className="mt-8 space-y-4">
        {perQuestion.map((q) => (
          <li
            key={q.questionNumber}
            className="rounded-xl border border-(--border) bg-(--bg-card) p-4"
          >
            <p className="text-sm font-medium text-(--text)">
              Question {q.questionNumber}: {q.correct ? '✓' : '✗'}
            </p>
            {q.studentAnswer != null && (
              <p className="mt-1 text-xs text-(--text-muted)">
                Your answer: {q.studentAnswer}
              </p>
            )}
            {q.correctAnswer != null && !q.correct && (
              <p className="mt-1 text-xs text-(--text-muted)">
                Correct: {q.correctAnswer}
              </p>
            )}
            <p className="mt-2 text-sm text-(--text)">{q.explanation}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex gap-4">
        <Link
          href={`/dashboard/listening/${podcastId}`}
          className="rounded-lg border border-(--border) px-4 py-2 text-sm hover:bg-(--bg-muted)"
        >
          {t('listening.results.backToList')}
        </Link>
        <Link
          href={`/dashboard/listening/${podcastId}`}
          className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Listen Again
        </Link>
      </div>
    </main>
  );
}
