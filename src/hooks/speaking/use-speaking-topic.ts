'use client';

import { useQuery } from '@tanstack/react-query';

import {
  type SpeakingTopicDetail,
  speakingApi,
} from '@/client-api/speaking.api';
import { useLanguageContext } from '@/providers/language-provider';

export function useSpeakingTopic(slug: string | null) {
  const { activeLanguage } = useLanguageContext();

  return useQuery({
    queryKey: ['speaking', 'topic', slug, activeLanguage],
    queryFn: async () => {
      if (!slug) throw new Error('Slug required');
      return speakingApi.getTopicBySlug(slug, { language: activeLanguage });
    },
    enabled: Boolean(slug) && Boolean(activeLanguage),
  });
}

export type { SpeakingTopicDetail };
