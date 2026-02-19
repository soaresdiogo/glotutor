'use client';

import { useQuery } from '@tanstack/react-query';

import { speakingApi } from '@/client-api/speaking.api';

export function useSpeakingSessionLimit() {
  return useQuery({
    queryKey: ['speaking', 'session', 'limit'],
    queryFn: () => speakingApi.getSessionLimit(),
  });
}
