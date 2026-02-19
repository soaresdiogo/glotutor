'use client';

import { DailyLimitBanner, LessonCard } from '@/components/native-lessons';
import { useNativeLessons } from '@/hooks/native-lessons';
import { useTranslate } from '@/locales';

export default function NativeLessonsPage() {
  const { t } = useTranslate();
  const { lessons, isLoading, isError, error, dailyLimit } = useNativeLessons();

  return (
    <main className="p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight text-(--text)">
          {t('nativeLessons.title')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
          {t('nativeLessons.subtitle')}
        </p>
      </header>

      <div className="mb-6">
        <DailyLimitBanner
          used={dailyLimit.used}
          limit={dailyLimit.limit}
          canStartNew={dailyLimit.canStartNew}
        />
      </div>

      {isLoading && (
        <div className="py-12 text-center text-(--text-muted)">
          {t('common.loading')}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
          <p className="text-(--text-muted)">
            {t('nativeLessons.errorLoading')}
          </p>
          <p className="mt-2 text-xs text-(--text-dim)">
            {error instanceof Error ? error.message : ''}
          </p>
        </div>
      )}

      {!isLoading && !isError && lessons.length === 0 && (
        <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
          <p className="text-(--text-muted)">{t('nativeLessons.noLessons')}</p>
        </div>
      )}

      {!isLoading && !isError && lessons.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonCard lesson={lesson} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
