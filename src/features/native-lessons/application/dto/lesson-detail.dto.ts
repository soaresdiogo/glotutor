import type { LessonContent } from '@/features/native-lessons/domain/types/lesson-content.types';

export type LessonDetailProgressDTO = {
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  exerciseResults: unknown | null;
};

export type LessonDetailDTO = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  language: string;
  sortOrder: number;
  content: LessonContent | null;
  progress?: LessonDetailProgressDTO;
};
