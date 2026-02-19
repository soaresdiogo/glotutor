'use client';

import { useQuery } from '@tanstack/react-query';

import {
  type ExerciseResultsResponse,
  listeningApi,
} from '@/client-api/listening.api';

export function useExerciseResults(podcastId: string | null) {
  return useQuery({
    queryKey: ['listening', 'exercises', 'results', podcastId],
    queryFn: async (): Promise<ExerciseResultsResponse> => {
      if (!podcastId) throw new Error('No podcast ID');
      return listeningApi.getExerciseResults(podcastId);
    },
    enabled: Boolean(podcastId),
  });
}

export type { ExerciseResultsResponse };
