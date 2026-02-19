import type { IUserLanguageStreakRepository } from '@/features/user-languages/domain/repositories/user-language-streak.repository.interface';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface IUpdateLanguageStreakUseCase {
  execute(
    userId: string,
    language: string,
    activityAt?: Date,
  ): Promise<{ currentStreakDays: number; longestStreakDays: number }>;
}

export class UpdateLanguageStreakUseCase
  implements IUpdateLanguageStreakUseCase
{
  constructor(private readonly streakRepo: IUserLanguageStreakRepository) {}

  async execute(
    userId: string,
    language: string,
    activityAt: Date = new Date(),
  ): Promise<{ currentStreakDays: number; longestStreakDays: number }> {
    const existing = await this.streakRepo.findByUserAndLanguage(
      userId,
      language,
    );

    const today = activityAt.toISOString().slice(0, 10);
    const yesterday = new Date(activityAt.getTime() - MS_PER_DAY)
      .toISOString()
      .slice(0, 10);

    let currentStreakDays: number;
    let longestStreakDays: number;

    if (!existing || !existing.lastActivityAt) {
      currentStreakDays = 1;
      longestStreakDays = 1;
    } else {
      const lastDate = existing.lastActivityAt.toISOString().slice(0, 10);
      if (lastDate === today) {
        currentStreakDays = existing.currentStreakDays;
        longestStreakDays = existing.longestStreakDays;
      } else if (lastDate === yesterday) {
        currentStreakDays = existing.currentStreakDays + 1;
        longestStreakDays = Math.max(
          existing.longestStreakDays,
          currentStreakDays,
        );
      } else {
        currentStreakDays = 1;
        longestStreakDays = existing.longestStreakDays;
      }
    }

    await this.streakRepo.upsert({
      userId,
      language,
      currentStreakDays,
      longestStreakDays,
      lastActivityAt: activityAt,
    });

    return { currentStreakDays, longestStreakDays };
  }
}
