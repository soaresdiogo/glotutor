'use client';

import { useQuery } from '@tanstack/react-query';

import { listeningApi, type PodcastDetail } from '@/client-api/listening.api';

export function usePodcastDetail(podcastId: string | null) {
  return useQuery({
    queryKey: ['listening', 'podcast', podcastId],
    queryFn: async () => {
      if (!podcastId) throw new Error('No podcast ID');
      return listeningApi.getPodcast(podcastId);
    },
    enabled: Boolean(podcastId),
  });
}

export type { PodcastDetail };
