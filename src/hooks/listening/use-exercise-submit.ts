'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  listeningApi,
  type SubmitExercisesPayload,
  type SubmitExercisesResponse,
} from '@/client-api/listening.api';

export function useExerciseSubmit(podcastId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: SubmitExercisesPayload,
    ): Promise<SubmitExercisesResponse> => {
      if (!podcastId) throw new Error('No podcast ID');
      return listeningApi.submitExercises(podcastId, payload);
    },
    onSuccess: (_, __, _context) => {
      if (podcastId) {
        queryClient.invalidateQueries({
          queryKey: ['listening', 'podcast', podcastId],
        });
        queryClient.invalidateQueries({ queryKey: ['listening', 'podcasts'] });
      }
    },
  });
}
