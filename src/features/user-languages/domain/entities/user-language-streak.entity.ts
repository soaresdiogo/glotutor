export type UserLanguageStreakEntity = {
  id: string;
  userId: string;
  language: string;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityAt: Date | null;
  updatedAt: Date;
};
