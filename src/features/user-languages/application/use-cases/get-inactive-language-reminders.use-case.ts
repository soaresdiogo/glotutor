import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import type { IUserLanguageStreakRepository } from '@/features/user-languages/domain/repositories/user-language-streak.repository.interface';

const INACTIVITY_DAYS_THRESHOLD = 5;

export type InactiveLanguageReminder = {
  language: string;
  daysSinceActivity: number;
};

export interface IGetInactiveLanguageRemindersUseCase {
  execute(userId: string): Promise<InactiveLanguageReminder[]>;
}

export class GetInactiveLanguageRemindersUseCase
  implements IGetInactiveLanguageRemindersUseCase
{
  constructor(
    private readonly progressRepo: IUserLanguageProgressRepository,
    private readonly streakRepo: IUserLanguageStreakRepository,
  ) {}

  async execute(userId: string): Promise<InactiveLanguageReminder[]> {
    const progressList = await this.progressRepo.findByUserId(userId);
    const now = new Date();
    const reminders: InactiveLanguageReminder[] = [];

    for (const p of progressList) {
      const streak = await this.streakRepo.findByUserAndLanguage(
        userId,
        p.language,
      );
      const lastAt = streak?.lastActivityAt;
      if (!lastAt) continue;
      const daysSince = Math.floor(
        (now.getTime() - lastAt.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (daysSince >= INACTIVITY_DAYS_THRESHOLD) {
        reminders.push({ language: p.language, daysSinceActivity: daysSince });
      }
    }

    return reminders;
  }
}
