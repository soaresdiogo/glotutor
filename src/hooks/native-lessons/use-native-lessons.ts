'use client';

import { useQuery } from '@tanstack/react-query';

import {
  type LessonListItem,
  nativeLessonsApi,
} from '@/client-api/native-lessons.api';
import { studentProfileApi } from '@/client-api/student-profile.api';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

function languageCodeToShort(code: string): string {
  return code.split('-')[0]?.toLowerCase() ?? code;
}

export function useNativeLessons() {
  const profileQuery = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentProfileApi.get(),
  });

  const language = profileQuery.data?.profile?.targetLanguage?.code
    ? languageCodeToShort(profileQuery.data.profile.targetLanguage.code)
    : 'en';
  const currentLevel =
    profileQuery.data?.profile?.currentLevel ?? CEFR_LEVELS[0];

  const lessonsQuery = useQuery({
    queryKey: ['native-lessons', language, currentLevel],
    queryFn: async () => {
      const res = await nativeLessonsApi.getLessons(language, currentLevel);
      return res.lessons;
    },
    enabled: !!language && !!currentLevel && profileQuery.isSuccess,
  });

  const dailyLimitQuery = useQuery({
    queryKey: ['native-lessons', 'daily-limit'],
    queryFn: () => nativeLessonsApi.getDailyLimit(),
    enabled: profileQuery.isSuccess,
  });

  const lessons = lessonsQuery.data ?? [];
  const dailyLimit = dailyLimitQuery.data;
  const canStartNew = dailyLimit?.canStartNew ?? true;
  const usedToday = dailyLimit?.used ?? 0;
  const limitToday = dailyLimit?.limit ?? 1;

  return {
    language,
    currentLevel,
    lessons,
    isLoading: profileQuery.isPending || lessonsQuery.isPending,
    isError: profileQuery.isError || lessonsQuery.isError,
    error: profileQuery.error ?? lessonsQuery.error,
    refetchLessons: lessonsQuery.refetch,
    dailyLimit: {
      used: usedToday,
      limit: limitToday,
      canStartNew,
    },
  };
}

export type { LessonListItem };
