'use client';

import { useQuery } from '@tanstack/react-query';

import {
  type SpeakingTopicDetail,
  speakingApi,
} from '@/client-api/speaking.api';

export function useSpeakingTopic(slug: string | null) {
  return useQuery({
    queryKey: ['speaking', 'topic', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug required');
      return speakingApi.getTopicBySlug(slug);
    },
    enabled: Boolean(slug),
  });
}

export type { SpeakingTopicDetail };
