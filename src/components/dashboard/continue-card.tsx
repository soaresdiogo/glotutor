'use client';

import Link from 'next/link';
import type { InProgressLesson } from '@/client-api/progress.api';
import { useTranslate } from '@/locales';

function formatLastActivity(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} h ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

type ContinueCardProps = Readonly<{
  inProgressLesson: InProgressLesson | null;
  lastActivityAt: string | null;
}>;

export function ContinueCard({
  inProgressLesson,
  lastActivityAt,
}: ContinueCardProps) {
  const { t } = useTranslate();
  const hasLesson = inProgressLesson != null;

  const content = (
    <div
      className={`grid gap-8 rounded-2xl border border-(--border) bg-(--bg-card) p-7 transition ${
        hasLesson
          ? 'md:grid-cols-[1fr_auto] hover:border-(--accent) hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]'
          : 'min-h-[180px] place-items-center place-content-center opacity-90'
      }`}
    >
      <div
        className={
          hasLesson
            ? 'flex flex-col gap-3'
            : 'flex flex-col items-center justify-center gap-3 text-center'
        }
      >
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-(--text-dim)">
          <span aria-hidden>⏱</span>
          {t('dashboard.lastActivity')}:
          {lastActivityAt
            ? formatLastActivity(lastActivityAt)
            : ` — ${t('dashboard.noActivity')}`}
        </p>
        {hasLesson ? (
          <>
            <h2 className="text-2xl font-medium text-(--text)">
              {inProgressLesson.level} · {inProgressLesson.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-(--text-muted)">
              <span className="flex items-center gap-1.5">
                {t('dashboard.learningModule')}
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-medium text-(--text-muted)">
              {t('dashboard.startALesson')}
            </h2>
            <Link
              href="/dashboard/native-lessons"
              className="inline-flex items-center gap-2 rounded-xl border border-(--accent) bg-(--accent-soft) px-5 py-2.5 text-sm font-semibold text-(--accent) transition hover:opacity-95"
            >
              {t('dashboard.browseLessons')}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <title>{t('dashboard.browseLessons')}</title>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </>
        )}
      </div>
      {hasLesson && (
        <div className="min-w-0 md:min-w-[280px]">
          <div className="mb-2.5 flex justify-between text-sm text-(--text-muted)">
            <span>{t('dashboard.progress')}</span>
            <span className="font-semibold text-(--accent) tabular-nums">
              {inProgressLesson.progressPercent}%
            </span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-(--bg-elevated)">
            <div
              className="h-full rounded-full bg-(--accent) transition-[width] duration-500"
              style={{ width: `${inProgressLesson.progressPercent}%` }}
            />
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            {t('dashboard.continueLesson')}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <title>{t('dashboard.continueLesson')}</title>
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );

  if (hasLesson) {
    return (
      <Link href={`/dashboard/native-lessons/${inProgressLesson.lessonId}`}>
        {content}
      </Link>
    );
  }
  return content;
}
