'use client';

import { usePodcastList } from '@/hooks/listening';

import { useTranslate } from '@/locales';

import { PodcastCard } from './podcast-card';

export function PodcastList() {
  const { t } = useTranslate();
  const { data, isPending, isError } = usePodcastList();

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">
          {t('listening.errorLoadingPodcasts')}
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">{t('listening.noPodcasts')}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((podcast) => (
        <li key={podcast.id}>
          <PodcastCard podcast={podcast} />
        </li>
      ))}
    </ul>
  );
}
