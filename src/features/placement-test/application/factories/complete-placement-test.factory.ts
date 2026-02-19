import type { ICompletePlacementTestUseCase } from '@/features/placement-test/application/use-cases/complete-placement-test.use-case';
import { CompletePlacementTestUseCase } from '@/features/placement-test/application/use-cases/complete-placement-test.use-case';
import { DrizzlePlacementAnswerRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-answer.repository';
import { DrizzlePlacementAttemptRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-attempt.repository';
import { db } from '@/infrastructure/db/client';

export function makeCompletePlacementTestUseCase(): ICompletePlacementTestUseCase {
  return new CompletePlacementTestUseCase(
    new DrizzlePlacementAttemptRepository(db),
    new DrizzlePlacementAnswerRepository(db),
  );
}
