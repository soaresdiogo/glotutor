'use client';

import { useQuery } from '@tanstack/react-query';

import {
  type SpeakingTopicListItem,
  speakingApi,
} from '@/client-api/speaking.api';

export function useSpeakingTopics(params?: {
  level?: string;
  language?: string;
}) {
  return useQuery({
    queryKey: ['speaking', 'topics', params?.level, params?.language],
    queryFn: async () => {
      const res = await speakingApi.listTopics(params);
      return res.topics;
    },
  });
}

export type { SpeakingTopicListItem };
