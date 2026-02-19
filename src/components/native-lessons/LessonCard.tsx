'use client';

import Link from 'next/link';
import type { LessonListItem } from '@/client-api/native-lessons.api';
import { useTranslate } from '@/locales';

const LEVEL_TAG_COLORS: Record<string, string> = {
  A1: 'var(--green-bg)',
  A2: 'var(--cyan-bg)',
  B1: 'var(--accent-soft)',
  B2: 'var(--orange-bg)',
  C1: 'var(--pink-bg)',
  C2: 'var(--red-bg)',
};

type Props = {
  lesson: LessonListItem;
};

export function LessonCard({ lesson }: Props) {
  const { t } = useTranslate();
  const status = lesson.progress?.status ?? 'not_started';
  const score = lesson.progress?.score;
  const bgTag = LEVEL_TAG_COLORS[lesson.level] ?? 'var(--bg-elevated)';

  return (
    <Link
      href={`/dashboard/native-lessons/${lesson.id}`}
      className="block rounded-xl border border-(--border) bg-(--bg-card) p-5 transition hover:border-(--border-light) hover:bg-(--bg-elevated)"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className="rounded px-2 py-0.5 font-mono text-xs font-semibold"
          style={{ background: bgTag, color: 'var(--text)' }}
        >
          {lesson.level}
        </span>
        {status === 'completed' && score != null && (
          <span className="text-sm font-medium text-(--accent)">{score}%</span>
        )}
        {status === 'in_progress' && (
          <span className="text-xs text-(--text-muted)">
            {t('nativeLessons.inProgress')}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-(--text)">{lesson.title}</h3>
      {lesson.description && (
        <p className="mt-1 line-clamp-2 text-sm text-(--text-muted)">
          {lesson.description}
        </p>
      )}
    </Link>
  );
}
