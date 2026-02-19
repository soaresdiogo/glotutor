import type { ICheckCertificationEligibilityUseCase } from '@/features/level-progress/application/use-cases/check-certification-eligibility.use-case';
import { CheckCertificationEligibilityUseCase } from '@/features/level-progress/application/use-cases/check-certification-eligibility.use-case';
import { DrizzleLevelProgressRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/level-progress.repository';
import { ContentTotalsProvider } from '@/features/level-progress/infrastructure/providers/content-totals.provider';
import { LevelProgressProvider } from '@/features/level-progress/infrastructure/providers/level-progress.provider';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { db } from '@/infrastructure/db/client';

export function makeCheckCertificationEligibilityUseCase(): ICheckCertificationEligibilityUseCase {
  return new CheckCertificationEligibilityUseCase(
    new LevelProgressProvider(
      db,
      new DrizzleLevelProgressRepository(db),
      new ContentTotalsProvider(db),
    ),
    new DrizzleUserLanguageProgressRepository(db),
  );
}
