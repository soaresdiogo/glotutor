export type ProgressOverviewEntity = {
  currentLevel: string;
  streakDays: number;
  totalPracticeMinutes: number;
  totalWordsLearned: number;
  lastPracticeDate: string | null;
  totalXp: number;
  thisWeekMinutes: number;
  lastActivityAt: string | null;
};
