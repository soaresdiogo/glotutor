import type { ISetPrimaryLanguageUseCase } from '@/features/user-languages/application/use-cases/set-primary-language.use-case';
import { SetPrimaryLanguageUseCase } from '@/features/user-languages/application/use-cases/set-primary-language.use-case';
import { DrizzleUserLanguagePreferencesRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-preferences.repository';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { db } from '@/infrastructure/db/client';

export function makeSetPrimaryLanguageUseCase(): ISetPrimaryLanguageUseCase {
  return new SetPrimaryLanguageUseCase(
    new DrizzleUserLanguageProgressRepository(db),
    new DrizzleUserLanguagePreferencesRepository(db),
  );
}
