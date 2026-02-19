'use client';

import Link from 'next/link';

import type { ReadingTextListItem } from '@/client-api/reading.api';
import { useTranslate } from '@/locales';

type TextCardProps = Readonly<{
  text: ReadingTextListItem;
}>;

export function TextCard({ text }: TextCardProps) {
  const { t } = useTranslate();
  const wordCount = text.wordCount ?? 0;
  const estMin = text.estimatedMinutes ?? Math.ceil(wordCount / 120);

  return (
    <Link
      href={`/dashboard/reading/${text.id}`}
      className="block rounded-xl border border-(--border) bg-(--bg-card) p-5 transition hover:border-(--accent-border) hover:bg-(--bg-elevated)"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {text.completed && (
          <span className="rounded-full border border-(--green-border) bg-(--green-bg) px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-(--green)">
            ✓ {t('reading.completed')}
          </span>
        )}
        <span className="rounded-full border border-(--accent-border) bg-(--accent-soft) px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-(--accent)">
          {text.level}
          {text.cefrLevel ? ` · ${text.cefrLevel}` : ''}
        </span>
        <span className="rounded-full border border-(--border) bg-(--bg-elevated) px-3 py-0.5 text-[11px] font-medium text-(--text-muted)">
          {text.category}
        </span>
      </div>
      <h2 className="text-xl font-medium text-(--text)">{text.title}</h2>
      <p className="mt-1 text-[13px] text-(--text-dim)">
        {wordCount} words<span className="mx-1.5">·</span>~{estMin} min read
      </p>
    </Link>
  );
}
