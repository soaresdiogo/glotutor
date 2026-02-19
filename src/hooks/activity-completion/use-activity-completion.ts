'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ActivityType } from '@/client-api/activity-completed.api';
import { activityCompletedApi } from '@/client-api/activity-completed.api';

export type CompleteActivityParams = {
  language: string;
  cefrLevel: string;
  activityType: ActivityType;
  activityId?: string;
  durationMinutes: number;
};

export function useActivityCompletion() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: CompleteActivityParams) =>
      activityCompletedApi.complete({
        language: params.language,
        cefrLevel: params.cefrLevel,
        activityType: params.activityType,
        activityId: params.activityId,
        durationMinutes: params.durationMinutes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-languages'] });
      queryClient.invalidateQueries({ queryKey: ['user-languages-check'] });
      queryClient.invalidateQueries({ queryKey: ['level-progress'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  return {
    completeActivity: mutation.mutateAsync,
    isCompleting: mutation.isPending,
    error: mutation.error,
  };
}
