'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { type SpeakingFeedback, speakingApi } from '@/client-api/speaking.api';

export function useSpeakingFeedback(sessionId: string | null) {
  return useQuery({
    queryKey: ['speaking', 'feedback', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID required');
      return speakingApi.getFeedback(sessionId);
    },
    enabled: Boolean(sessionId),
  });
}

export function useSubmitSpeakingFeedback(sessionId: string | null) {
  return useMutation({
    mutationFn: async (
      transcript: Array<{ role: 'user' | 'assistant'; content: string }>,
    ) => {
      if (!sessionId) throw new Error('Session ID required');
      return speakingApi.submitFeedback(sessionId, transcript);
    },
    mutationKey: ['speaking', 'submitFeedback', sessionId],
  });
}

export type { SpeakingFeedback };
