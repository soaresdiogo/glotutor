import type { IUserLanguagePreferencesRepository } from '@/features/user-languages/domain/repositories/user-language-preferences.repository.interface';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import type { IUserLanguageStreakRepository } from '@/features/user-languages/domain/repositories/user-language-streak.repository.interface';

export type UserLanguageSummary = {
  language: string;
  currentLevel: string;
  isPrimary: boolean;
  currentStreakDays: number;
  longestStreakDays: number;
  progressId: string;
};

export interface IGetUserLanguagesUseCase {
  execute(userId: string): Promise<UserLanguageSummary[]>;
}

export class GetUserLanguagesUseCase implements IGetUserLanguagesUseCase {
  constructor(
    private readonly progressRepo: IUserLanguageProgressRepository,
    private readonly preferencesRepo: IUserLanguagePreferencesRepository,
    private readonly streakRepo: IUserLanguageStreakRepository,
  ) {}

  async execute(userId: string): Promise<UserLanguageSummary[]> {
    const [progressList, prefs] = await Promise.all([
      this.progressRepo.findByUserId(userId),
      this.preferencesRepo.findById(userId),
    ]);

    const primaryLanguage =
      prefs?.primaryLanguage ?? progressList[0]?.language ?? null;

    const summaries: UserLanguageSummary[] = await Promise.all(
      progressList.map(async (p) => {
        const streak =
          (await this.streakRepo.findByUserAndLanguage(userId, p.language)) ??
          null;
        return {
          language: p.language,
          currentLevel: p.currentLevel,
          isPrimary: p.language === primaryLanguage,
          currentStreakDays: streak?.currentStreakDays ?? 0,
          longestStreakDays: streak?.longestStreakDays ?? 0,
          progressId: p.id,
        };
      }),
    );

    return summaries;
  }
}
