import { makeCompleteCertificationExamUseCase } from '@/features/level-progress/application/factories/complete-certification-exam.factory';
import type { IAnswerCertificationQuestionUseCase } from '@/features/level-progress/application/use-cases/answer-certification-question.use-case';
import { AnswerCertificationQuestionUseCase } from '@/features/level-progress/application/use-cases/answer-certification-question.use-case';
import { DrizzleCertificationExamRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/certification-exam.repository';
import { DrizzleCertificationExamAnswerRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/certification-exam-answer.repository';
import { DrizzlePlacementQuestionRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-question.repository';
import { db } from '@/infrastructure/db/client';

export function makeAnswerCertificationQuestionUseCase(): IAnswerCertificationQuestionUseCase {
  return new AnswerCertificationQuestionUseCase(
    new DrizzleCertificationExamRepository(db),
    new DrizzlePlacementQuestionRepository(db),
    new DrizzleCertificationExamAnswerRepository(db),
    makeCompleteCertificationExamUseCase(),
  );
}
