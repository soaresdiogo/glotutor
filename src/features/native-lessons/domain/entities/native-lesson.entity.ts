import type { LessonContent } from '../types/lesson-content.types';

export type NativeLessonEntity = {
  id: string;
  language: string;
  level: string;
  title: string;
  description: string | null;
  sortOrder: number;
  content: LessonContent | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};
