import type { ICheckUserHasLanguagesUseCase } from '@/features/user-languages/application/use-cases/check-user-has-languages.use-case';
import { CheckUserHasLanguagesUseCase } from '@/features/user-languages/application/use-cases/check-user-has-languages.use-case';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { db } from '@/infrastructure/db/client';

export function makeCheckUserHasLanguagesUseCase(): ICheckUserHasLanguagesUseCase {
  return new CheckUserHasLanguagesUseCase(
    new DrizzleUserLanguageProgressRepository(db),
  );
}
