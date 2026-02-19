import type { IStartCertificationExamUseCase } from '@/features/level-progress/application/use-cases/start-certification-exam.use-case';
import { StartCertificationExamUseCase } from '@/features/level-progress/application/use-cases/start-certification-exam.use-case';
import { DrizzleCertificationExamRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/certification-exam.repository';
import { DrizzleLevelProgressRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/level-progress.repository';
import { ContentTotalsProvider } from '@/features/level-progress/infrastructure/providers/content-totals.provider';
import { LevelProgressProvider } from '@/features/level-progress/infrastructure/providers/level-progress.provider';
import { DrizzlePlacementQuestionRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-question.repository';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { db } from '@/infrastructure/db/client';

export function makeStartCertificationExamUseCase(): IStartCertificationExamUseCase {
  return new StartCertificationExamUseCase(
    new LevelProgressProvider(
      db,
      new DrizzleLevelProgressRepository(db),
      new ContentTotalsProvider(db),
    ),
    new DrizzleUserLanguageProgressRepository(db),
    new DrizzleCertificationExamRepository(db),
    new DrizzlePlacementQuestionRepository(db),
  );
}
