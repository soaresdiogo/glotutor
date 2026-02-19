'use client';

import { useTranslate } from '@/locales';

type ReadingStatsProps = Readonly<{
  wpm: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  missedCount?: number;
}>;

export function ReadingStats({
  wpm,
  greenCount,
  yellowCount,
  redCount,
}: ReadingStatsProps) {
  const { t } = useTranslate();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-(--border) bg-(--bg-card) px-4 py-4 text-center">
        <div className="font-mono text-2xl font-medium text-(--accent)">
          {wpm}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-(--text-muted)">
          {t('reading.wordsPerMin')}
        </div>
      </div>
      <div className="rounded-xl border border-(--border) bg-(--bg-card) px-4 py-4 text-center">
        <div className="font-mono text-2xl font-medium text-(--green)">
          {greenCount}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-(--text-muted)">
          {t('reading.correct')}
        </div>
      </div>
      <div className="rounded-xl border border-(--border) bg-(--bg-card) px-4 py-4 text-center">
        <div className="font-mono text-2xl font-medium text-(--yellow)">
          {yellowCount}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-(--text-muted)">
          {t('reading.legendAlmost')}
        </div>
      </div>
      <div className="rounded-xl border border-(--border) bg-(--bg-card) px-4 py-4 text-center">
        <div className="font-mono text-2xl font-medium text-(--red)">
          {redCount}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-(--text-muted)">
          {t('reading.legendPractice')}
        </div>
      </div>
    </div>
  );
}
