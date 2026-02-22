'use client';

import { useQuery } from '@tanstack/react-query';

import { listeningApi, type PodcastListItem } from '@/client-api/listening.api';
import { useLanguageContext } from '@/providers/language-provider';

export function usePodcastList() {
  const { activeLanguage, languages } = useLanguageContext();
  const level =
    languages.find((l) => l.language === activeLanguage)?.currentLevel ?? 'A1';

  return useQuery({
    queryKey: ['listening', 'podcasts', activeLanguage, level],
    queryFn: async () => {
      const res = await listeningApi.listPodcasts({
        language: activeLanguage,
        level,
      });
      return res.podcasts;
    },
    enabled: !!activeLanguage && languages.length > 0,
  });
}

export type { PodcastListItem };
