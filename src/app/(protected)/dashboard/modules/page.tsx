'use client';

import { useId } from 'react';
import { ModuleCard } from '@/components/dashboard';
import { useProgress } from '@/hooks/use-progress';
import { useSidebarCounts } from '@/hooks/use-sidebar-counts';
import { useTranslate } from '@/locales';

export default function ModulesPage() {
  const { t } = useTranslate();
  const headingId = useId();
  const { data: progressData } = useProgress();
  const { speakingCount, listeningCount, readingCount, nativeLessonsCount } =
    useSidebarCounts();

  const speakingProgress =
    speakingCount > 0 && progressData
      ? Math.round((progressData.speaking.length / speakingCount) * 100)
      : 0;
  const listeningProgress =
    listeningCount > 0 && progressData
      ? Math.round((progressData.listening.length / listeningCount) * 100)
      : 0;
  const readingProgress =
    readingCount > 0 && progressData
      ? Math.round((progressData.reading.length / readingCount) * 100)
      : 0;
  const learningProgress =
    nativeLessonsCount > 0 && progressData
      ? Math.round(
          (progressData.nativeLessons.length / nativeLessonsCount) * 100,
        )
      : 0;

  return (
    <main className="p-6 md:p-8">
      <header className="mb-8">
        <h1
          id={headingId}
          className="text-3xl font-medium tracking-tight text-(--text)"
        >
          {t('dashboard.practiceModules')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
          {t('dashboard.practiceModulesDesc')}
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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
    </main>
  );
}
