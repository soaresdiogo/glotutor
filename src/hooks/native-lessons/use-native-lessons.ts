'use client';

import { useQuery } from '@tanstack/react-query';

import {
  type LessonListItem,
  nativeLessonsApi,
} from '@/client-api/native-lessons.api';
import { useLanguageContext } from '@/providers/language-provider';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export function useNativeLessons() {
  const { activeLanguage, languages } = useLanguageContext();

  const currentLevel =
    languages.find((l) => l.language === activeLanguage)?.currentLevel ??
    CEFR_LEVELS[0];
  const language = activeLanguage;

  const lessonsQuery = useQuery({
    queryKey: ['native-lessons', language, currentLevel],
    queryFn: async () => {
      const res = await nativeLessonsApi.getLessons(language, currentLevel);
      return res.lessons;
    },
    enabled: !!language && !!currentLevel && languages.length > 0,
  });

  const dailyLimitQuery = useQuery({
    queryKey: ['native-lessons', 'daily-limit'],
    queryFn: () => nativeLessonsApi.getDailyLimit(),
    enabled: languages.length > 0,
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
    isLoading: lessonsQuery.isPending,
    isError: lessonsQuery.isError,
    error: lessonsQuery.error,
    refetchLessons: lessonsQuery.refetch,
    dailyLimit: {
      used: usedToday,
      limit: limitToday,
      canStartNew,
    },
  };
}

export type { LessonListItem };
