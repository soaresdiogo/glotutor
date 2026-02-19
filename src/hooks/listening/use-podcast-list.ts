'use client';

import { useQuery } from '@tanstack/react-query';

import { listeningApi, type PodcastListItem } from '@/client-api/listening.api';

export function usePodcastList() {
  return useQuery({
    queryKey: ['listening', 'podcasts'],
    queryFn: async () => {
      const res = await listeningApi.listPodcasts();
      return res.podcasts;
    },
  });
}

export type { PodcastListItem };
