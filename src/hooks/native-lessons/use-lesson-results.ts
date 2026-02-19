'use client';

import { useQuery } from '@tanstack/react-query';

import { nativeLessonsApi } from '@/client-api/native-lessons.api';

export function useLessonResults(lessonId: string | null) {
  const lessonQuery = useQuery({
    queryKey: ['native-lesson', lessonId],
    queryFn: () => nativeLessonsApi.getLesson(lessonId!),
    enabled: !!lessonId,
  });

  const lesson = lessonQuery.data ?? null;
  const progress = lesson?.progress;
  const score = progress?.score ?? null;
  const completedAt = progress?.completedAt ?? null;
  const exerciseResults = (progress?.exerciseResults ?? null) as Array<{
    exerciseIndex: number;
    type: string;
    correct: boolean;
    score?: number;
    userAnswer?: string | string[];
    correctAnswer?: string | string[];
    feedback?: string;
  }> | null;

  return {
    lesson,
    score,
    completedAt,
    exerciseResults: exerciseResults ?? [],
    isLoading: lessonQuery.isPending,
    isError: lessonQuery.isError,
    error: lessonQuery.error,
  };
}
