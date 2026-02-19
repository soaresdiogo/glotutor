export type CompletedNativeLessonEntity = {
  id: string;
  lessonId: string;
  title: string;
  level: string;
  score: number | null;
  completedAt: string;
};
