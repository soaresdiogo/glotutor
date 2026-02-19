import type { IGetUserLanguagesUseCase } from '@/features/user-languages/application/use-cases/get-user-languages.use-case';
import { GetUserLanguagesUseCase } from '@/features/user-languages/application/use-cases/get-user-languages.use-case';
import { DrizzleUserLanguagePreferencesRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-preferences.repository';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { DrizzleUserLanguageStreakRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-streak.repository';
import { db } from '@/infrastructure/db/client';

export function makeGetUserLanguagesUseCase(): IGetUserLanguagesUseCase {
  return new GetUserLanguagesUseCase(
    new DrizzleUserLanguageProgressRepository(db),
    new DrizzleUserLanguagePreferencesRepository(db),
    new DrizzleUserLanguageStreakRepository(db),
  );
}
