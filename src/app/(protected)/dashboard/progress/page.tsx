'use client';

import Link from 'next/link';
import { useId } from 'react';
import type {
  CompletedListening,
  CompletedNativeLesson,
  CompletedReading,
  CompletedSpeaking,
} from '@/client-api/progress.api';
import { StatCard } from '@/components/dashboard';
import { useProgress } from '@/hooks/use-progress';
import { useTranslate } from '@/locales';

function ProgressSection<
  T extends { id: string; title: string; completedAt: string },
>({
  title,
  icon,
  href,
  items,
  renderItem,
  emptyKey,
}: {
  title: string;
  icon: string;
  href: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyKey: string;
}) {
  const { t } = useTranslate();
  const headingId = useId();
  const hasItems = items.length > 0;

  return (
    <section className="mb-10" aria-labelledby={headingId}>
      <div className="mb-4 flex items-center justify-between">
        <h2
          id={headingId}
          className="flex items-center gap-2 text-xl font-medium text-(--text)"
        >
          <span className="text-2xl" aria-hidden>
            {icon}
          </span>
          {title}
        </h2>
        <Link
          href={href}
          className="text-sm font-medium text-(--accent) no-underline hover:underline"
        >
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="rounded-xl border border-(--border) bg-(--bg-card)">
        {hasItems ? (
          <ul className="divide-y divide-(--border)">
            {items.slice(0, 10).map((item) => (
              <li key={item.id}>{renderItem(item)}</li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-8 text-center text-(--text-muted)">
            {t(emptyKey)}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProgressPage() {
  const progressHeadingId = useId();
  const overviewHeadingId = useId();
  const { t } = useTranslate();
  const {
    data,
    isPending,
    isError,
    formatDate,
    formatPracticeMinutes,
    formatAccuracyPercent,
    totalCompleted,
  } = useProgress();

  if (isPending) {
    return (
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-(--text-muted)">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
          <p className="text-(--text-muted)">{t('progress.errorLoading')}</p>
        </div>
      </main>
    );
  }

  const { overview, nativeLessons, listening, reading, speaking } = data;

  return (
    <main className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1
            id={progressHeadingId}
            className="mb-1.5 text-3xl font-medium text-(--text)"
          >
            {t('progress.title')}
          </h1>
          <p className="text-[15px] leading-relaxed text-(--text-muted)">
            {t('progress.subtitle')}
          </p>
        </header>

        <section
          className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-labelledby={overviewHeadingId}
        >
          <h2 id={overviewHeadingId} className="sr-only">
            {t('progress.overview')}
          </h2>
          <StatCard
            icon="📊"
            value={overview.currentLevel}
            label={t('progress.currentLevel')}
            accentColor="accent"
          />
          <StatCard
            icon="🔥"
            value={overview.streakDays}
            label={t('progress.streakDays')}
            accentColor="orange"
          />
          <StatCard
            icon="⏱️"
            value={formatPracticeMinutes(
              overview.totalPracticeMinutes,
              t('progress.minutesShort'),
            )}
            label={t('progress.totalPractice')}
            accentColor="cyan"
          />
          <StatCard
            icon="✓"
            value={totalCompleted}
            label={t('progress.totalCompleted')}
            accentColor="green"
          />
        </section>

        {totalCompleted === 0 ? (
          <div className="rounded-xl border border-(--border) bg-(--bg-card) p-12 text-center">
            <p className="text-(--text-muted)">{t('progress.noActivityYet')}</p>
            <p className="mt-2 text-sm text-(--text-dim)">
              {t('progress.noActivityHint')}
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-xl font-medium text-(--text)">
              {t('progress.whatYouStudied')}
            </h2>

            <ProgressSection<CompletedNativeLesson>
              title={t('dashboard.learning')}
              icon="📖"
              href="/dashboard/native-lessons"
              items={nativeLessons}
              emptyKey="progress.noNativeLessons"
              renderItem={(item) => (
                <Link
                  href={`/dashboard/native-lessons/${item.lessonId}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-(--bg-elevated)"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-(--text)">
                      {item.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-(--text-muted)">
                      <span className="rounded bg-(--bg-muted) px-1.5 py-0.5">
                        {item.level}
                      </span>
                      <span>{formatDate(item.completedAt)}</span>
                    </p>
                  </div>
                  {item.score != null && (
                    <span className="shrink-0 text-sm font-semibold text-(--accent)">
                      {item.score}%
                    </span>
                  )}
                </Link>
              )}
            />

            <ProgressSection<CompletedListening>
              title={t('dashboard.listening')}
              icon="👂"
              href="/dashboard/listening"
              items={listening}
              emptyKey="progress.noListening"
              renderItem={(item) => (
                <Link
                  href={`/dashboard/listening/${item.podcastId}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-(--bg-elevated)"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-(--text)">
                      {item.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-(--text-muted)">
                      <span className="rounded bg-(--bg-muted) px-1.5 py-0.5">
                        {item.level}
                      </span>
                      <span>{formatDate(item.completedAt)}</span>
                    </p>
                  </div>
                  {item.exerciseScore != null && (
                    <span className="shrink-0 text-sm font-semibold text-(--accent)">
                      {item.exerciseScore}/5
                    </span>
                  )}
                </Link>
              )}
            />

            <ProgressSection<CompletedReading>
              title={t('dashboard.reading')}
              icon="📖"
              href="/dashboard/reading"
              items={reading}
              emptyKey="progress.noReading"
              renderItem={(item) => (
                <Link
                  href={`/dashboard/reading/${item.textId}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-(--bg-elevated)"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-(--text)">
                      {item.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-(--text-muted)">
                      {item.wordsPerMinute != null && (
                        <span>{item.wordsPerMinute} WPM</span>
                      )}
                      {item.accuracy != null && (
                        <span>
                          {formatAccuracyPercent(item.accuracy)}{' '}
                          {t('progress.accuracy')}
                        </span>
                      )}
                      <span>{formatDate(item.completedAt)}</span>
                    </p>
                  </div>
                </Link>
              )}
            />

            <ProgressSection<CompletedSpeaking>
              title={t('dashboard.speaking')}
              icon="🗣️"
              href="/dashboard/speaking"
              items={speaking}
              emptyKey="progress.noSpeaking"
              renderItem={(item) => (
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-(--text)">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-(--text-muted)">
                      {formatDate(item.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            />
          </>
        )}
      </div>
    </main>
  );
}
