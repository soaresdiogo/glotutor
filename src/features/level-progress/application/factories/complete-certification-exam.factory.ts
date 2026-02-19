import type { ICompleteCertificationExamUseCase } from '@/features/level-progress/application/use-cases/complete-certification-exam.use-case';
import { CompleteCertificationExamUseCase } from '@/features/level-progress/application/use-cases/complete-certification-exam.use-case';
import { DrizzleCertificationExamRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/certification-exam.repository';
import { DrizzleCertificationExamAnswerRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/certification-exam-answer.repository';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { db } from '@/infrastructure/db/client';

export function makeCompleteCertificationExamUseCase(): ICompleteCertificationExamUseCase {
  return new CompleteCertificationExamUseCase(
    new DrizzleCertificationExamRepository(db),
    new DrizzleCertificationExamAnswerRepository(db),
    new DrizzleUserLanguageProgressRepository(db),
  );
}
