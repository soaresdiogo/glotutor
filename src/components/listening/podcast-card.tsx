'use client';

import Link from 'next/link';

import type { PodcastListItem } from '@/client-api/listening.api';
import { useTranslate } from '@/locales';

export function PodcastCard({ podcast }: { podcast: PodcastListItem }) {
  const { t } = useTranslate();
  const minutes = Math.ceil(podcast.durationSeconds / 60);
  const status = podcast.progress?.exerciseCompletedAt
    ? 'completed'
    : podcast.progress && podcast.progress.listenedPercentage > 0
      ? 'inProgress'
      : 'notStarted';

  return (
    <Link
      href={`/dashboard/listening/${podcast.id}`}
      className="block rounded-xl border border-(--border) bg-(--bg-card) p-5 transition-colors hover:border-(--border-strong) hover:bg-(--bg-elevated)"
    >
      <h3 className="font-medium text-(--text)">{podcast.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-(--text-muted)">
        {podcast.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-(--bg-muted) px-2 py-0.5 text-xs text-(--text-muted)">
          {t('listening.podcastCard.level', { level: podcast.cefrLevel })}
        </span>
        <span className="text-xs text-(--text-muted)">
          {t('listening.podcastCard.duration', { minutes })}
        </span>
        {status === 'completed' && podcast.progress?.exerciseScore != null && (
          <span className="text-xs font-medium text-(--text)">
            {t('listening.podcastCard.score', {
              score: podcast.progress.exerciseScore,
              total:
                podcast.progress.totalQuestions ?? podcast.exerciseCount ?? 5,
            })}
          </span>
        )}
        {status === 'inProgress' && (
          <span className="text-xs text-(--text-muted)">
            {t('listening.podcastCard.inProgress')}
          </span>
        )}
        {status === 'notStarted' && (
          <span className="text-xs text-(--text-muted)">
            {t('listening.podcastCard.notStarted')}
          </span>
        )}
      </div>
    </Link>
  );
}
