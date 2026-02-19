export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type LessonListItemDTO = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  language: string;
  sortOrder: number;
  progress?: {
    status: LessonProgressStatus;
    score: number | null;
    completedAt: Date | null;
  };
};
