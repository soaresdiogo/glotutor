'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { studentProfileApi } from '@/client-api/student-profile.api';

export function useLearningPreferences() {
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentProfileApi.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof studentProfileApi.update>[0]) =>
      studentProfileApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
  });

  return {
    profile: data?.profile ?? null,
    supportedLanguages: data?.supportedLanguages ?? [],
    options: data?.options ?? { cefrLevels: [], nativeLanguageCodes: [] },
    isPending,
    isError,
    updateMutation,
  };
}
