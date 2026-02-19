'use client';

import Link from 'next/link';
import type { SpeakingTopicListItem } from '@/hooks/speaking';

type SpeakingTopicCardProps = Readonly<{
  topic: SpeakingTopicListItem;
}>;

export function SpeakingTopicCard({ topic }: SpeakingTopicCardProps) {
  return (
    <Link
      href={`/dashboard/speaking/${topic.slug}`}
      className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--bg-card) p-4 transition hover:border-(--border-light) hover:bg-(--bg-hover)"
    >
      <span className="text-2xl" aria-hidden>
        🎙️
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-(--text)">{topic.title}</h3>
        <p className="mt-0.5 text-sm text-(--text-muted)">
          {topic.description}
        </p>
        <span className="mt-2 inline-block rounded-md bg-(--bg-elevated) px-2 py-0.5 font-mono text-xs text-(--text-muted)">
          {topic.cefrLevel}
        </span>
      </div>
    </Link>
  );
}
