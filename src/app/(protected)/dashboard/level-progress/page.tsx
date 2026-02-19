'use client';

import Link from 'next/link';
import { useLevelProgress } from '@/hooks/level-progress/use-level-progress';
import { useLanguageContext } from '@/providers/language-provider';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function ActivityBar({
  label,
  icon,
  completed,
  total,
}: {
  label: string;
  icon: string;
  completed: number;
  total: number;
}) {
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-(--text)">
          <span aria-hidden>{icon}</span>
          {label}
        </span>
        <span className="text-sm text-(--text-muted)">
          {completed}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-(--border)">
        <div
          className="h-full rounded-full bg-(--accent) transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function LevelProgressPage() {
  const { activeLanguage } = useLanguageContext();
  const { data, isLoading, isError } = useLevelProgress();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl flex-1 p-6">
        <p className="text-(--text-muted)">Loading progress…</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto max-w-3xl flex-1 p-6">
        <p className="text-(--text-muted)">Could not load level progress.</p>
      </main>
    );
  }

  const currentIndex = CEFR_LEVELS.indexOf(data.cefrLevel);

  return (
    <main className="mx-auto max-w-3xl flex-1 p-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← Back to dashboard
      </Link>

      <h1 className="mb-2 text-2xl font-semibold text-(--text)">
        Level progress — {data.cefrLevel}
      </h1>
      <p className="mb-8 text-(--text-muted)">
        Complete activities to unlock the certification exam and advance to the
        next level.
      </p>

      <div className="mb-8 flex items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-(--accent) bg-(--bg-card)">
          <span className="text-2xl font-bold text-(--text)">
            {data.completionPercentage.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <ActivityBar
          label="Native Lessons"
          icon="📚"
          completed={data.lessonsCompleted}
          total={data.lessonsTotal}
        />
        <ActivityBar
          label="Podcasts (Listening)"
          icon="🎧"
          completed={data.podcastsCompleted}
          total={data.podcastsTotal}
        />
        <ActivityBar
          label="Reading Aloud"
          icon="📖"
          completed={data.readingsCompleted}
          total={data.readingsTotal}
        />
        <ActivityBar
          label="Conversation Practice"
          icon="💬"
          completed={data.conversationsCompleted}
          total={data.conversationsTotal}
        />
      </div>

      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="mb-4 text-lg font-semibold text-(--text)">
          Certification
        </h2>
        {data.certifiedAt ? (
          <div>
            <p className="mb-2 text-(--text)">
              ✅ Level {data.cefrLevel} certified
            </p>
            <p className="mb-4 text-sm text-(--text-muted)">
              Completed on {new Date(data.certifiedAt).toLocaleDateString()}
            </p>
            {currentIndex < CEFR_LEVELS.length - 1 && (
              <Link
                href={`/dashboard/certification/${activeLanguage}`}
                className="inline-block rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Continue to {CEFR_LEVELS[currentIndex + 1]}
              </Link>
            )}
          </div>
        ) : data.certificationUnlocked ? (
          <div>
            <p className="mb-4 text-(--text)">
              Certification exam available! Pass with 70% or higher to unlock
              the next level.
            </p>
            <Link
              href={`/dashboard/certification/${activeLanguage}`}
              className="inline-block rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Start certification exam
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-(--text-muted)">
              Complete 80% of activities to unlock the certification exam.
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--border)">
              <div
                className="h-full rounded-full bg-(--accent/50) transition-all"
                style={{
                  width: `${Math.min(100, (data.completionPercentage / 80) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        {CEFR_LEVELS.map((level, i) => {
          const isCurrent = level === data.cefrLevel;
          const isPast = i < currentIndex;
          const isLocked = i > currentIndex && !data.certifiedAt;
          return (
            <span
              key={level}
              className={`rounded-lg px-3 py-1 text-sm font-medium ${
                isCurrent
                  ? 'bg-(--accent) text-white'
                  : isPast
                    ? 'bg-(--bg-elevated) text-(--text-muted)'
                    : isLocked
                      ? 'bg-(--border) text-(--text-muted) opacity-60'
                      : 'bg-(--bg-elevated) text-(--text)'
              }`}
            >
              {level}
              {isPast && ' ✓'}
            </span>
          );
        })}
      </div>
    </main>
  );
}
