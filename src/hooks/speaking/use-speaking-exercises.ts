'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { type SpeakingExercise, speakingApi } from '@/client-api/speaking.api';

export function useSpeakingExercises(topicId: string | null) {
  return useQuery({
    queryKey: ['speaking', 'exercises', topicId],
    queryFn: async () => {
      if (!topicId) throw new Error('Topic ID required');
      const res = await speakingApi.getTopicExercises(topicId);
      return res.exercises;
    },
    enabled: Boolean(topicId),
  });
}

export function useSubmitExerciseAttempt() {
  return useMutation({
    mutationFn: (payload: {
      sessionId: string;
      exerciseId: string;
      answer: string | string[] | Record<string, string>;
    }) => speakingApi.submitExerciseAttempt(payload),
  });
}

export type { SpeakingExercise };
