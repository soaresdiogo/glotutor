import { httpClient } from '@/shared/lib/http-client';

export type UserLanguageSummary = {
  language: string;
  currentLevel: string;
  isPrimary: boolean;
  currentStreakDays: number;
  longestStreakDays: number;
  progressId: string;
};

export type AddLanguageResponse = {
  id: string;
  language: string;
  currentLevel: string;
  startedAt: string;
};

export const userLanguagesApi = {
  check: () =>
    httpClient.get('user-languages/check').json<{ hasLanguages: boolean }>(),

  list: () =>
    httpClient
      .get('user-languages')
      .json<{ languages: UserLanguageSummary[] }>(),

  add: (body: {
    language: string;
    placementAttemptId?: string;
    selectedLevel?: string;
  }) =>
    httpClient
      .post('user-languages', { json: body })
      .json<AddLanguageResponse>(),

  setPrimary: (language: string) =>
    httpClient
      .post('user-languages/set-primary', { json: { language } })
      .json<{ primaryLanguage: string }>(),

  getStats: () =>
    httpClient.get('user-languages/stats').json<{
      stats: Array<{
        language: string;
        currentLevel: string;
        totalMinutes: number;
        thisWeekMinutes: number;
        currentStreakDays: number;
        longestStreakDays: number;
      }>;
    }>(),

  getInactiveReminders: () =>
    httpClient.get('user-languages/inactive-reminders').json<{
      reminders: Array<{
        language: string;
        daysSinceActivity: number;
      }>;
    }>(),
};
