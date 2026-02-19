'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { useAudioProgress } from '@/hooks/listening/use-audio-progress';
import { usePodcastDetail } from '@/hooks/listening/use-podcast-detail';
import { useTranslate } from '@/locales';

export default function PodcastPlayerPage() {
  const params = useParams();
  const podcastId = params.podcastId as string;
  const { t } = useTranslate();
  const { data: podcast, isPending, isError } = usePodcastDetail(podcastId);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reached80, setReached80] = useState(false);
  const onMilestone = useCallback((pct: number) => {
    if (pct >= 80) setReached80(true);
  }, []);
  useAudioProgress(audioRef, podcastId, {
    isAudioReady: !!podcast && !!podcast.audioUrl,
    onMilestone,
  });

  if (isPending) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </main>
    );
  }

  if (isError || !podcast) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">
          {t('listening.errorLoadingPodcasts')}
        </p>
        <Link
          href="/dashboard/listening"
          className="mt-4 inline-block text-sm text-(--accent) hover:underline"
        >
          {t('listening.results.backToList')}
        </Link>
      </main>
    );
  }

  const canStartExercises =
    (podcast.progress?.listenedPercentage ?? 0) >= 80 || reached80;
  const hasCompletedExercises = Boolean(podcast.progress?.exerciseCompletedAt);

  return (
    <main className="p-6 md:p-8">
      <Link
        href="/dashboard/listening"
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← {t('listening.results.backToList')}
      </Link>
      <header className="mb-6">
        <h1 className="text-2xl font-medium text-(--text)">{podcast.title}</h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          {podcast.description}
        </p>
        <span className="mt-2 inline-block rounded-md bg-(--bg-muted) px-2 py-0.5 text-xs text-(--text-muted)">
          {t('listening.podcastCard.level', { level: podcast.cefrLevel })}
        </span>
        <span className="ml-2 text-xs text-(--text-muted)">
          {t('listening.podcastCard.duration', {
            minutes: Math.ceil(podcast.durationSeconds / 60),
          })}
        </span>
      </header>
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
        {podcast.audioUrl ? (
          <>
            {/* biome-ignore lint/a11y/useMediaCaption: podcast audio has no captions available */}
            <audio
              ref={audioRef}
              src={`/api/listening/podcasts/${podcastId}/audio`}
              controls
              className="w-full"
            />
            <p className="mt-2 text-xs text-(--text-muted)">
              {podcast.progress?.listenedPercentage ?? 0}% listened
            </p>
          </>
        ) : (
          <p className="text-sm text-(--text-muted)">
            {t('listening.player.audioNotAvailable')}
          </p>
        )}
      </div>
      {podcast.vocabularyHighlights.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-(--text)">
            {t('listening.player.vocabulary')}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {podcast.vocabularyHighlights.map((v) => (
              <li
                key={`${v.word}-${v.translation}`}
                className="rounded-md bg-(--bg-muted) px-2 py-1 text-sm text-(--text-muted)"
              >
                <strong className="text-(--text)">{v.word}</strong>
                <span className="ml-1">— {v.translation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-8">
        {hasCompletedExercises ? (
          <Link
            href={`/dashboard/listening/${podcastId}/exercises/results`}
            className="inline-flex items-center rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t('listening.results.title')}
          </Link>
        ) : canStartExercises ? (
          <Link
            href={`/dashboard/listening/${podcastId}/exercises`}
            className="inline-flex items-center rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t('listening.player.startExercises')}
          </Link>
        ) : (
          <p className="text-sm text-(--text-muted)">
            {t('listening.player.listenMore')}
          </p>
        )}
      </div>
    </main>
  );
}
