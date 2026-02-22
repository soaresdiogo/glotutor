'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useId } from 'react';
import { authApi } from '@/client-api/auth.api';
import {
  AchievementCard,
  ContinueCard,
  ModuleCard,
  StatCard,
} from '@/components/dashboard';
import { useProgress } from '@/hooks/use-progress';
import { useSidebarCounts } from '@/hooks/use-sidebar-counts';
import { useTranslate } from '@/locales';

function formatXp(xp: number): string {
  return xp.toLocaleString();
}

function formatWeekMinutes(mins: number): string {
  if (mins >= 60) return `${(mins / 60).toFixed(1)}h`;
  return `${mins}m`;
}

function pct(count: number, total: number): number {
  if (total <= 0 || count < 0) return 0;
  return Math.min(100, Math.round((count / total) * 100));
}

type ProgressCounts = {
  speaking: number;
  listening: number;
  reading: number;
  nativeLessons: number;
};

function computeModuleProgress(
  progressData:
    | {
        speaking: unknown[];
        listening: unknown[];
        reading: unknown[];
        nativeLessons: unknown[];
      }
    | null
    | undefined,
  counts: ProgressCounts,
): { speaking: number; listening: number; reading: number; learning: number } {
  if (!progressData) {
    return { speaking: 0, listening: 0, reading: 0, learning: 0 };
  }
  return {
    speaking: pct(progressData.speaking.length, counts.speaking),
    listening: pct(progressData.listening.length, counts.listening),
    reading: pct(progressData.reading.length, counts.reading),
    learning: pct(progressData.nativeLessons.length, counts.nativeLessons),
  };
}

function getOverviewStats(
  overview: { totalXp: number; thisWeekMinutes: number } | null | undefined,
): { totalXpDisplay: string; weekMinutesDisplay: string } {
  return {
    totalXpDisplay: overview ? formatXp(overview.totalXp) : '0',
    weekMinutesDisplay: overview
      ? formatWeekMinutes(overview.thisWeekMinutes)
      : '0m',
  };
}

export default function DashboardPage() {
  const pageTitleId = useId();
  const statsHeadingId = useId();
  const continueHeadingId = useId();
  const modulesHeadingId = useId();
  const achievementsHeadingId = useId();
  const { t } = useTranslate();
  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    staleTime: 1000 * 60 * 5,
  });
  const { data: progressData, isPending: progressPending } = useProgress();
  const { speakingCount, listeningCount, readingCount, nativeLessonsCount } =
    useSidebarCounts();

  const userName = user?.name ?? t('dashboard.guestUser');
  const overview = progressData?.overview;
  const inProgressLesson = progressData?.inProgressLesson ?? null;
  const lastActivityAt = overview?.lastActivityAt ?? null;

  const totalCompleted =
    (progressData?.nativeLessons.length ?? 0) +
    (progressData?.listening.length ?? 0) +
    (progressData?.reading.length ?? 0) +
    (progressData?.speaking.length ?? 0);

  const {
    speaking: speakingProgress,
    listening: listeningProgress,
    reading: readingProgress,
    learning: learningProgress,
  } = computeModuleProgress(progressData, {
    speaking: speakingCount,
    listening: listeningCount,
    reading: readingCount,
    nativeLessons: nativeLessonsCount,
  });

  const streak = overview?.streakDays ?? 0;
  const streakBest = streak >= 7;
  const { totalXpDisplay, weekMinutesDisplay } = getOverviewStats(overview);
  const firstSteps = totalCompleted >= 10;
  const weekWarrior = streakBest;
  const speaker = (progressData?.speaking.length ?? 0) >= 50;
  const bookworm = (progressData?.reading.length ?? 0) >= 25;

  if (progressPending && !progressData) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-8 py-8">
          <p className="text-(--text-muted)">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        <header className="mb-8">
          <h1
            id={pageTitleId}
            className="mb-1.5 text-3xl font-medium text-(--text)"
          >
            {t('dashboard.welcomeBack', { name: userName })}
          </h1>
          <p className="text-[15px] leading-relaxed text-(--text-muted)">
            {t('dashboard.subtitle')}
          </p>
        </header>

        <section
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-labelledby={statsHeadingId}
        >
          <h2 id={statsHeadingId} className="sr-only">
            {t('dashboard.statsOverview')}
          </h2>
          <StatCard
            icon="⚡"
            value={totalXpDisplay}
            label={t('dashboard.stats.totalXp')}
            accentColor="accent"
          />
          <StatCard
            icon="✓"
            value={totalCompleted}
            label={t('dashboard.stats.lessonsCompleted')}
            accentColor="green"
          />
          <StatCard
            icon="🔥"
            value={streak}
            label={t('dashboard.stats.dayStreak')}
            trend={streakBest ? t('dashboard.streakBest') : undefined}
            trendUp={streakBest}
            accentColor="orange"
          />
          <StatCard
            icon="⏱️"
            value={weekMinutesDisplay}
            label={t('dashboard.stats.thisWeek')}
            accentColor="cyan"
          />
        </section>

        <section className="mb-8" aria-labelledby={continueHeadingId}>
          <h2
            id={continueHeadingId}
            className="mb-5 text-2xl font-medium text-(--text)"
          >
            {t('dashboard.continueLearning')}
          </h2>
          <ContinueCard
            inProgressLesson={inProgressLesson}
            lastActivityAt={lastActivityAt}
          />
        </section>

        <section className="mb-8" aria-labelledby={modulesHeadingId}>
          <div className="mb-5 flex items-center justify-between">
            <h2
              id={modulesHeadingId}
              className="text-2xl font-medium text-(--text)"
            >
              {t('dashboard.practiceModules')}
            </h2>
            <Link
              href="/dashboard/modules"
              className="flex items-center gap-1 text-sm font-medium text-(--accent) no-underline transition hover:gap-2"
            >
              {t('dashboard.viewAll')}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <title>{t('dashboard.viewAll')}</title>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <ModuleCard
              variant="speaking"
              href="/dashboard/speaking"
              titleKey="dashboard.speaking"
              descKey="dashboard.speakingDesc"
              progress={speakingProgress}
            />
            <ModuleCard
              variant="listening"
              href="/dashboard/listening"
              titleKey="dashboard.listening"
              descKey="dashboard.listeningDesc"
              progress={listeningProgress}
            />
            <ModuleCard
              variant="reading"
              href="/dashboard/reading"
              titleKey="dashboard.reading"
              descKey="dashboard.readingDesc"
              progress={readingProgress}
            />
            <ModuleCard
              variant="learning"
              href="/dashboard/native-lessons"
              titleKey="dashboard.learning"
              descKey="dashboard.learningDesc"
              progress={learningProgress}
            />
          </div>
        </section>

        <section className="mb-8" aria-labelledby={achievementsHeadingId}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2
              id={achievementsHeadingId}
              className="flex flex-wrap items-center gap-2 text-2xl font-medium text-(--text)"
            >
              {t('dashboard.recentAchievements')}
              <span className="rounded-full bg-(--accent/15) px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-(--accent)">
                {t('common.comingSoon')}
              </span>
            </h2>
            <Link
              href="/dashboard/achievements"
              className="flex items-center gap-1 text-sm font-medium text-(--accent) no-underline transition hover:gap-2"
            >
              {t('dashboard.viewAll')}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <title>{t('dashboard.viewAll')}</title>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <AchievementCard
              icon="🎯"
              titleKey="dashboard.achievement.firstSteps"
              descKey="dashboard.achievement.firstStepsDesc"
              locked={!firstSteps}
            />
            <AchievementCard
              icon="🔥"
              titleKey="dashboard.achievement.weekWarrior"
              descKey="dashboard.achievement.weekWarriorDesc"
              locked={!weekWarrior}
            />
            <AchievementCard
              icon="🗣️"
              titleKey="dashboard.achievement.speaker"
              descKey="dashboard.achievement.speakerDesc"
              locked={!speaker}
            />
            <AchievementCard
              icon="📚"
              titleKey="dashboard.achievement.bookworm"
              descKey="dashboard.achievement.bookwormDesc"
              locked={!bookworm}
            />
            <AchievementCard
              icon="💎"
              titleKey="dashboard.achievement.diamond"
              descKey="dashboard.achievement.diamondDesc"
              locked
            />
            <AchievementCard
              icon="🏆"
              titleKey="dashboard.achievement.champion"
              descKey="dashboard.achievement.championDesc"
              locked
            />
          </div>
        </section>
      </div>
    </main>
  );
}
