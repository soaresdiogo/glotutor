import type { IGetInactiveLanguageRemindersUseCase } from '@/features/user-languages/application/use-cases/get-inactive-language-reminders.use-case';
import { GetInactiveLanguageRemindersUseCase } from '@/features/user-languages/application/use-cases/get-inactive-language-reminders.use-case';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { DrizzleUserLanguageStreakRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-streak.repository';
import { db } from '@/infrastructure/db/client';

export function makeGetInactiveLanguageRemindersUseCase(): IGetInactiveLanguageRemindersUseCase {
  return new GetInactiveLanguageRemindersUseCase(
    new DrizzleUserLanguageProgressRepository(db),
    new DrizzleUserLanguageStreakRepository(db),
  );
}
