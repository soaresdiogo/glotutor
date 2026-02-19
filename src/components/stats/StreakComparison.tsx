'use client';

import type { LanguageStudyStats } from '@/client-api/user-languages-stats.api';

type StreakComparisonProps = {
  stats: LanguageStudyStats[];
};

export function StreakComparison({ stats }: StreakComparisonProps) {
  if (stats.length === 0) return null;

  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
      <h3 className="mb-4 text-lg font-semibold text-(--text)">
        Streak comparison
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.language}
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg) px-4 py-3"
          >
            <span className="font-medium text-(--text)">
              {s.language.toUpperCase()}
            </span>
            <div className="flex items-center gap-4">
              <span
                className="text-sm text-(--text-muted)"
                title="Current streak"
              >
                🔥 {s.currentStreakDays}
              </span>
              <span
                className="text-sm text-(--text-muted)"
                title="Longest streak"
              >
                Best: {s.longestStreakDays}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
