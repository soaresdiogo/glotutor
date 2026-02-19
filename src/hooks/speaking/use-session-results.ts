'use client';

import { useQuery } from '@tanstack/react-query';

import { type SessionResults, speakingApi } from '@/client-api/speaking.api';

export function useSessionResults(sessionId: string | null) {
  return useQuery({
    queryKey: ['speaking', 'sessionResults', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID required');
      return speakingApi.getSessionResults(sessionId);
    },
    enabled: Boolean(sessionId),
  });
}

export type { SessionResults };
