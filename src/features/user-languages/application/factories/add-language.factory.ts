import { DrizzleLevelProgressRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/level-progress.repository';
import { ContentTotalsProvider } from '@/features/level-progress/infrastructure/providers/content-totals.provider';
import { DrizzlePlacementAttemptRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-attempt.repository';
import type { IAddLanguageUseCase } from '@/features/user-languages/application/use-cases/add-language.use-case';
import { AddLanguageUseCase } from '@/features/user-languages/application/use-cases/add-language.use-case';
import { DrizzleUserLanguagePreferencesRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-preferences.repository';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { DrizzleUserLanguageStreakRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-streak.repository';
import { db } from '@/infrastructure/db/client';

export function makeAddLanguageUseCase(): IAddLanguageUseCase {
  return new AddLanguageUseCase(
    new DrizzleUserLanguageProgressRepository(db),
    new DrizzleUserLanguagePreferencesRepository(db),
    new DrizzleUserLanguageStreakRepository(db),
    new DrizzlePlacementAttemptRepository(db),
    new DrizzleLevelProgressRepository(db),
    new ContentTotalsProvider(db),
  );
}
