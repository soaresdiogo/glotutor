export type NativeLessonProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed';

export type NativeLessonProgressEntity = {
  id: string;
  userId: string;
  lessonId: string;
  status: NativeLessonProgressStatus;
  score: number | null;
  exerciseResults: unknown | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
