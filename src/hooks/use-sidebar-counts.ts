'use client';

import { useQuery } from '@tanstack/react-query';

import { readingApi } from '@/client-api/reading.api';
import { studentProfileApi } from '@/client-api/student-profile.api';
import { usePodcastList } from '@/hooks/listening';
import { useNativeLessons } from '@/hooks/native-lessons';
import { useSpeakingTopics } from '@/hooks/speaking';
import { useLanguageContext } from '@/providers/language-provider';

export function useSidebarCounts() {
  const { activeLanguage, languages } = useLanguageContext();
  const pathLevel =
    languages.find((l) => l.language === activeLanguage)?.currentLevel ?? 'A1';
  const profileQuery = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentProfileApi.get(),
  });

  const { data: speakingTopics, isPending: speakingPending } =
    useSpeakingTopics({ language: activeLanguage, level: pathLevel });
  const { data: podcasts, isPending: listeningPending } = usePodcastList();
  const { lessons: nativeLessons, isLoading: nativeLessonsLoading } =
    useNativeLessons();

  const readingQuery = useQuery({
    queryKey: ['reading', 'texts', activeLanguage, pathLevel],
    queryFn: async () => {
      const res = await readingApi.listTexts({
        language: activeLanguage,
        level: pathLevel,
      });
      return res.texts;
    },
    enabled: !!activeLanguage && languages.length > 0,
  });

  const speakingCount = speakingTopics?.length ?? 0;
  const listeningCount = podcasts?.length ?? 0;
  const readingCount = readingQuery.data?.length ?? 0;
  const nativeLessonsCount = nativeLessons?.length ?? 0;

  const isLoading =
    profileQuery.isPending ||
    readingQuery.isPending ||
    speakingPending ||
    listeningPending ||
    nativeLessonsLoading;

  return {
    pathLevel,
    speakingCount,
    listeningCount,
    readingCount,
    nativeLessonsCount,
    isLoading,
  };
}
