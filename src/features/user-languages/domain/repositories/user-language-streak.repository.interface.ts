import type { UserLanguageStreakEntity } from '../entities/user-language-streak.entity';

export interface IUserLanguageStreakRepository {
  findByUserAndLanguage(
    userId: string,
    language: string,
  ): Promise<UserLanguageStreakEntity | null>;

  upsert(data: {
    userId: string;
    language: string;
    currentStreakDays: number;
    longestStreakDays: number;
    lastActivityAt: Date | null;
  }): Promise<UserLanguageStreakEntity>;
}
