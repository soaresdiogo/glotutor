'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { LevelSelector } from '@/components/placement-test/LevelSelector';
import { ProgressBar } from '@/components/placement-test/ProgressBar';
import { QuestionCard } from '@/components/placement-test/QuestionCard';
import { usePlacementTest } from '@/hooks/placement-test';

/** Must match backend PLACEMENT_MAX_QUESTIONS (cefr-levels.ts). */
const PLACEMENT_MAX_QUESTIONS = 20;

export default function PlacementTestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';
  const language = (params?.language as string) ?? 'en';

  const goToOnboardingConfirm = (level: string, attemptId: string | null) => {
    const url = `/dashboard/onboarding/confirm?language=${encodeURIComponent(language)}&level=${encodeURIComponent(level)}${attemptId ? `&attemptId=${encodeURIComponent(attemptId)}` : ''}`;
    router.push(url);
  };
  const {
    state,
    CEFR_LEVELS,
    startTest,
    submitAnswer,
    skipTest,
    confirmLevel,
    startWithLevel,
    goToLevelSelect,
    isStarting,
    isAnswering,
    isSkipping,
    isConfirming,
  } = usePlacementTest(language);

  const isLoading = isStarting || isAnswering || isSkipping || isConfirming;

  return (
    <main className="mx-auto max-w-2xl flex-1 p-6">
      <Link
        href={isOnboarding ? '/dashboard/onboarding' : '/dashboard'}
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← {isOnboarding ? 'Back' : 'Back to dashboard'}
      </Link>

      {state.phase === 'intro' && (
        <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-(--text)">
            Find your level
          </h1>
          <p className="mb-8 text-(--text-muted)">
            Answer a few questions so we can recommend the right level for you.
            You can skip and choose a level manually if you prefer.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={startTest}
              disabled={isLoading}
              className="rounded-xl bg-(--accent) px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isStarting ? 'Starting…' : 'Start the test'}
            </button>
            <button
              type="button"
              onClick={() => skipTest()}
              disabled={isLoading}
              className="text-sm text-(--text-muted) underline hover:text-(--accent)"
            >
              Skip and choose level
            </button>
          </div>
        </section>
      )}

      {state.phase === 'question' && state.currentQuestion && (
        <section>
          <div className="mb-4 flex items-center justify-between text-sm text-(--text-muted)">
            <span>
              Question {state.questionsAnswered + 1} of{' '}
              {PLACEMENT_MAX_QUESTIONS}
            </span>
          </div>
          <ProgressBar
            current={state.questionsAnswered}
            total={PLACEMENT_MAX_QUESTIONS}
            className="mb-6"
          />
          <QuestionCard
            question={state.currentQuestion}
            onSelect={submitAnswer}
            disabled={isAnswering}
          />
        </section>
      )}

      {state.phase === 'result' && (
        <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-8">
          <h2 className="mb-2 text-xl font-semibold text-(--text)">
            Recommended level: {state.recommendedLevel}
          </h2>
          <p className="mb-6 text-(--text-muted)">
            We suggest you start at {state.recommendedLevel}. You can start here
            or choose another level below.
          </p>
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                const level =
                  state.selectedLevel ?? state.recommendedLevel ?? 'A1';
                if (isOnboarding) {
                  goToOnboardingConfirm(level, state.attemptId);
                } else {
                  startWithLevel(level, state.attemptId);
                }
              }}
              disabled={isConfirming}
              className="w-full rounded-xl bg-(--accent) py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isConfirming
                ? 'Adding language…'
                : `Start at ${state.selectedLevel ?? state.recommendedLevel}`}
            </button>
          </div>
          <button
            type="button"
            onClick={goToLevelSelect}
            className="text-sm text-(--text-muted) underline hover:text-(--accent)"
          >
            Choose another level
          </button>
        </section>
      )}

      {state.phase === 'level-select' && (
        <section>
          <LevelSelector
            levels={CEFR_LEVELS}
            selectedLevel={state.selectedLevel ?? 'A1'}
            onSelect={confirmLevel}
            onConfirm={() => {
              const level = state.selectedLevel ?? 'A1';
              if (isOnboarding) {
                goToOnboardingConfirm(level, state.attemptId);
              } else {
                startWithLevel(level, state.attemptId);
              }
            }}
            disabled={isConfirming}
          />
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
