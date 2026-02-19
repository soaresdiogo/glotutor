'use client';

import { useId } from 'react';
import { AchievementCard } from '@/components/dashboard';
import { useProgress } from '@/hooks/use-progress';
import { useTranslate } from '@/locales';

export default function AchievementsPage() {
  const { t } = useTranslate();
  const headingId = useId();
  const { data: progressData } = useProgress();

  const totalCompleted =
    (progressData?.nativeLessons.length ?? 0) +
    (progressData?.listening.length ?? 0) +
    (progressData?.reading.length ?? 0) +
    (progressData?.speaking.length ?? 0);
  const streak = progressData?.overview?.streakDays ?? 0;
  const speakingCount = progressData?.speaking.length ?? 0;
  const readingCount = progressData?.reading.length ?? 0;

  const firstSteps = totalCompleted >= 10;
  const weekWarrior = streak >= 7;
  const speaker = speakingCount >= 50;
  const bookworm = readingCount >= 25;

  return (
    <main className="p-6 md:p-8">
      <header className="mb-8">
        <h1
          id={headingId}
          className="text-3xl font-medium tracking-tight text-(--text)"
        >
          {t('dashboard.recentAchievements')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
          {t('dashboard.achievementsPageDesc')}
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
    </main>
  );
}
