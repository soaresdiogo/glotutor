'use client';

import { useQuery } from '@tanstack/react-query';

import { speakingApi } from '@/client-api/speaking.api';
import { useLanguageContext } from '@/providers/language-provider';

export type LastCompletedSession = {
  sessionId: string | null;
  completedAt: string | null;
};

export function useLastCompletedSession(slug: string | undefined) {
  const { activeLanguage } = useLanguageContext();

  return useQuery({
    queryKey: ['speaking', 'lastCompletedSession', slug, activeLanguage],
    queryFn: async () => {
      if (!slug) throw new Error('Slug required');
      return speakingApi.getLastCompletedSession(slug, {
        language: activeLanguage,
      });
    },
    enabled: Boolean(slug) && Boolean(activeLanguage),
  });
}
