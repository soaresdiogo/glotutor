import { httpClient } from '@/shared/lib/http-client';

export type DailyMinutes = { date: string; minutes: number };

export type LanguageStudyStats = {
  language: string;
  currentLevel: string;
  totalMinutes: number;
  thisWeekMinutes: number;
  currentStreakDays: number;
  longestStreakDays: number;
  weeklyDailyMinutes: DailyMinutes[];
};

export type UserLanguagesStatsResponse = {
  stats: LanguageStudyStats[];
};

export const userLanguagesStatsApi = {
  getStats: () =>
    httpClient.get('user-languages/stats').json<UserLanguagesStatsResponse>(),
};
