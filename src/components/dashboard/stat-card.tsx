'use client';

import type { ReactNode } from 'react';

type AccentColor = 'accent' | 'green' | 'orange' | 'cyan';

const ACCENT_STYLES: Record<AccentColor, { bg: string; color: string }> = {
  accent: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
  cyan: { bg: 'var(--cyan-bg)', color: 'var(--cyan)' },
  green: { bg: 'var(--green-bg)', color: 'var(--green)' },
  orange: { bg: 'var(--orange-bg)', color: 'var(--orange)' },
};

type StatCardProps = Readonly<{
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  accentColor?: AccentColor;
}>;

export function StatCard({
  icon,
  value,
  label,
  trend,
  trendUp = true,
  accentColor = 'accent',
}: StatCardProps) {
  const styles = ACCENT_STYLES[accentColor];

  return (
    <article className="rounded-2xl border border-(--border) bg-(--bg-card) p-6 transition">
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{ background: styles.bg, color: styles.color }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              trendUp ? 'text-(--green)' : 'text-(--red)'
            }`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transform: trendUp ? undefined : 'rotate(180deg)' }}
              aria-hidden
            >
              <title>{trendUp ? 'Trend up' : 'Trend down'}</title>
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {trend}
          </span>
        )}
      </div>
      <p
        className="mb-1 text-3xl font-semibold tabular-nums"
        style={{ color: styles.color }}
      >
        {value}
      </p>
      <p className="text-sm text-(--text-muted)">{label}</p>
    </article>
  );
}
