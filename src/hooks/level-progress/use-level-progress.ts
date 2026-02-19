'use client';

import { useQuery } from '@tanstack/react-query';
import { useLanguageContext } from '@/providers/language-provider';
import { httpClient } from '@/shared/lib/http-client';

export type LevelProgressData = {
  language: string;
  cefrLevel: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  podcastsTotal: number;
  podcastsCompleted: number;
  readingsTotal: number;
  readingsCompleted: number;
  conversationsTotal: number;
  conversationsCompleted: number;
  completionPercentage: number;
  certificationUnlocked: boolean;
  certifiedAt: string | null;
};

export function useLevelProgress() {
  const { activeLanguage } = useLanguageContext();

  const query = useQuery({
    queryKey: ['level-progress', activeLanguage],
    queryFn: () =>
      httpClient
        .get(`level-progress?language=${encodeURIComponent(activeLanguage)}`)
        .json<LevelProgressData>(),
    enabled: !!activeLanguage,
  });

  return {
    ...query,
    data: query.data,
    activeLanguage,
  };
}
