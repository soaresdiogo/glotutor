'use client';

import type { DailyMinutes } from '@/client-api/user-languages-stats.api';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LANGUAGE_COLORS: Record<string, string> = {
  en: 'var(--accent)',
  pt: '#0d9488',
  es: '#f59e0b',
  fr: '#6366f1',
  de: '#ef4444',
  it: '#8b5cf6',
};

type StudyTimeChartProps = {
  /** Keyed by language; value is daily minutes for the week */
  readonly dataByLanguage: Record<string, DailyMinutes[]>;
  /** Ordered list of days (YYYY-MM-DD) for the current week */
  readonly weekDays: string[];
};

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] ?? '#64748b';
}

function getDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

export function StudyTimeChart({
  dataByLanguage,
  weekDays,
}: StudyTimeChartProps) {
  const languages = Object.keys(dataByLanguage);
  const maxMinutes =
    Math.max(
      ...languages.flatMap((lang) =>
        (dataByLanguage[lang] ?? []).map((d) => d.minutes),
      ),
      1,
    ) || 1;

  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
      <h3 className="mb-4 text-lg font-semibold text-(--text)">
        Weekly study time
      </h3>
      <div className="flex items-end gap-1" style={{ minHeight: 120 }}>
        {weekDays.map((day) => (
          <div key={day} className="flex flex-1 flex-col gap-1">
            {languages.map((lang) => {
              const dayData = (dataByLanguage[lang] ?? []).find(
                (d) => d.date === day,
              );
              const minutes = dayData?.minutes ?? 0;
              const height = Math.round((minutes / maxMinutes) * 100);
              return (
                <div
                  key={`${day}-${lang}`}
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${Math.max(height, 2)}%`,
                    backgroundColor: getLanguageColor(lang),
                  }}
                  title={`${lang} ${minutes} min`}
                />
              );
            })}
            <span className="mt-1 text-center text-xs text-(--text-muted)">
              {getDayLabel(day)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {languages.map((lang) => (
          <span key={lang} className="text-sm text-(--text-muted)">
            {lang.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
