import type { IUpdateLanguageStreakUseCase } from '@/features/user-languages/application/use-cases/update-language-streak.use-case';
import { UpdateLanguageStreakUseCase } from '@/features/user-languages/application/use-cases/update-language-streak.use-case';
import { DrizzleUserLanguageStreakRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-streak.repository';
import { db } from '@/infrastructure/db/client';

export function makeUpdateLanguageStreakUseCase(): IUpdateLanguageStreakUseCase {
  return new UpdateLanguageStreakUseCase(
    new DrizzleUserLanguageStreakRepository(db),
  );
}
