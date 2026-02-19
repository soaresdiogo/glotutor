export type PlacementAttemptStatus = 'in_progress' | 'completed' | 'skipped';

export type PlacementAttemptEntity = {
  id: string;
  userId: string;
  language: string;
  status: PlacementAttemptStatus;
  recommendedLevel: string | null;
  selectedLevel: string | null;
  totalQuestions: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
