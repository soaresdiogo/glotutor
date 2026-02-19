'use client';

import { useQuery } from '@tanstack/react-query';

import { speakingApi } from '@/client-api/speaking.api';

export type LastCompletedSession = {
  sessionId: string | null;
  completedAt: string | null;
};

export function useLastCompletedSession(slug: string | undefined) {
  return useQuery({
    queryKey: ['speaking', 'lastCompletedSession', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug required');
      return speakingApi.getLastCompletedSession(slug);
    },
    enabled: Boolean(slug),
  });
}
