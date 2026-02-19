'use client';

import { ActivityBreakdown } from '@/components/stats/ActivityBreakdown';
import { StreakComparison } from '@/components/stats/StreakComparison';
import { StudyTimeChart } from '@/components/stats/StudyTimeChart';
import { useLanguageStats } from '@/hooks/language-stats/use-language-stats';

function getWeekDays(): string[] {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function StatsPage() {
  const { data, isLoading, isError, error } = useLanguageStats();
  const weekDays = getWeekDays();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl flex-1 p-6">
        <h1 className="mb-6 text-2xl font-semibold text-(--text)">
          Statistics
        </h1>
        <div className="h-64 animate-pulse rounded-2xl bg-(--border)" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto max-w-4xl flex-1 p-6">
        <h1 className="mb-6 text-2xl font-semibold text-(--text)">
          Statistics
        </h1>
        <p className="text-(--text-muted)">
          {error?.message ?? 'Failed to load statistics.'}
        </p>
      </main>
    );
  }

  const stats = data.stats ?? [];
  const dataByLanguage: Record<string, { date: string; minutes: number }[]> =
    {};
  for (const s of stats) {
    dataByLanguage[s.language] = s.weeklyDailyMinutes ?? [];
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 p-6">
      <h1 className="mb-6 text-2xl font-semibold text-(--text)">Statistics</h1>
      <div className="flex flex-col gap-6">
        <StudyTimeChart dataByLanguage={dataByLanguage} weekDays={weekDays} />
        <StreakComparison stats={stats} />
        <ActivityBreakdown stats={stats} />
      </div>
    </main>
  );
}
