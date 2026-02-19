import type { IAnswerPlacementQuestionUseCase } from '@/features/placement-test/application/use-cases/answer-placement-question.use-case';
import { AnswerPlacementQuestionUseCase } from '@/features/placement-test/application/use-cases/answer-placement-question.use-case';
import { DrizzlePlacementAnswerRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-answer.repository';
import { DrizzlePlacementAttemptRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-attempt.repository';
import { DrizzlePlacementQuestionRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-question.repository';
import { db } from '@/infrastructure/db/client';

export function makeAnswerPlacementQuestionUseCase(): IAnswerPlacementQuestionUseCase {
  return new AnswerPlacementQuestionUseCase(
    new DrizzlePlacementAttemptRepository(db),
    new DrizzlePlacementQuestionRepository(db),
    new DrizzlePlacementAnswerRepository(db),
  );
}
