'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProgressBar } from '@/components/placement-test/ProgressBar';
import { QuestionCard } from '@/components/placement-test/QuestionCard';
import { useCertificationExam } from '@/hooks/certification/use-certification-exam';

export default function CertificationExamPage() {
  const params = useParams();
  const language = (params?.language as string) ?? 'en';
  const { state, startExam, submitAnswer, isStarting, isAnswering } =
    useCertificationExam(language);

  const isLoading = isStarting || isAnswering;

  return (
    <main className="mx-auto max-w-2xl flex-1 p-6">
      <Link
        href="/dashboard/level-progress"
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← Back to level progress
      </Link>

      {state.phase === 'intro' && (
        <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-8">
          <h1 className="mb-2 text-2xl font-semibold text-(--text)">
            Certification exam
          </h1>
          <p className="mb-6 text-(--text-muted)">
            This exam tests all skills. You need 70% or higher to pass and
            unlock the next level. No feedback is shown during the exam.
          </p>
          <button
            type="button"
            onClick={startExam}
            disabled={isLoading}
            className="w-full rounded-xl bg-(--accent) py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isStarting ? 'Starting…' : 'Start exam'}
          </button>
        </section>
      )}

      {state.phase === 'question' && state.currentQuestion && (
        <section>
          <div className="mb-4 text-sm text-(--text-muted)">
            Question {state.questionsAnswered + 1} of {state.totalQuestions}
          </div>
          <ProgressBar
            current={state.questionsAnswered}
            total={state.totalQuestions}
            className="mb-6"
          />
          <QuestionCard
            question={state.currentQuestion}
            onSelect={submitAnswer}
            disabled={isAnswering}
          />
        </section>
      )}

      {state.phase === 'result-pass' && state.result && (
        <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-8 text-center">
          <div className="mb-4 text-5xl" aria-hidden>
            🎉
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-(--text)">
            Congratulations! You&apos;ve completed {state.cefrLevel}!
          </h2>
          <p className="mb-4 text-(--text-muted)">
            You scored {state.result.score.toFixed(0)}%
          </p>
          {state.result.nextLevelUnlocked && (
            <Link
              href="/dashboard/level-progress"
              className="inline-block rounded-xl bg-(--accent) px-6 py-3 font-medium text-white hover:opacity-90"
            >
              Continue to {state.result.nextLevelUnlocked}
            </Link>
          )}
          {!state.result.nextLevelUnlocked && (
            <Link
              href="/dashboard/level-progress"
              className="inline-block rounded-xl bg-(--accent) px-6 py-3 font-medium text-white hover:opacity-90"
            >
              Back to level progress
            </Link>
          )}
        </section>
      )}

      {state.phase === 'result-fail' && state.result && (
        <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-(--text)">
            Keep practicing
          </h2>
          <p className="mb-4 text-(--text-muted)">
            You scored {state.result.score.toFixed(0)}%. You need 70% to pass.
            Complete more activities and try again.
          </p>
          <Link
            href="/dashboard/level-progress"
            className="inline-block rounded-xl bg-(--accent) px-6 py-3 font-medium text-white hover:opacity-90"
          >
            Back to studying
          </Link>
        </section>
      )}

      {state.error && (
        <div
          className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {state.error}
        </div>
      )}
    </main>
  );
}
