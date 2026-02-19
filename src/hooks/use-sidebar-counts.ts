'use client';

import { useQuery } from '@tanstack/react-query';

import { readingApi } from '@/client-api/reading.api';
import { studentProfileApi } from '@/client-api/student-profile.api';
import { usePodcastList } from '@/hooks/listening';
import { useNativeLessons } from '@/hooks/native-lessons';
import { useSpeakingTopics } from '@/hooks/speaking';

export function useSidebarCounts() {
  const profileQuery = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentProfileApi.get(),
  });

  const { data: speakingTopics, isPending: speakingPending } =
    useSpeakingTopics();
  const { data: podcasts, isPending: listeningPending } = usePodcastList();
  const { lessons: nativeLessons, isLoading: nativeLessonsLoading } =
    useNativeLessons();

  const readingQuery = useQuery({
    queryKey: ['reading', 'texts'],
    queryFn: async () => {
      const res = await readingApi.listTexts();
      return res.texts;
    },
  });

  const profile = profileQuery.data?.profile ?? null;
  const pathLevel = profile?.currentLevel ?? 'A1';
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
