'use client';

import type { LanguageStudyStats } from '@/client-api/user-languages-stats.api';

type ActivityBreakdownProps = {
  stats: LanguageStudyStats[];
};

export function ActivityBreakdown({ stats }: ActivityBreakdownProps) {
  if (stats.length === 0) return null;

  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
      <h3 className="mb-4 text-lg font-semibold text-(--text)">
        Study time summary
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.language}
            className="rounded-xl border border-(--border) bg-(--bg) p-4"
          >
            <div className="mb-1 font-medium text-(--text)">
              {s.language.toUpperCase()} — {s.currentLevel}
            </div>
            <div className="text-sm text-(--text-muted)">
              This week: {s.thisWeekMinutes} min · Total: {s.totalMinutes} min
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
