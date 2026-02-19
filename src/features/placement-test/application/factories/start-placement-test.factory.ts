import type { IStartPlacementTestUseCase } from '@/features/placement-test/application/use-cases/start-placement-test.use-case';
import { StartPlacementTestUseCase } from '@/features/placement-test/application/use-cases/start-placement-test.use-case';
import { DrizzlePlacementAttemptRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-attempt.repository';
import { DrizzlePlacementQuestionRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-question.repository';
import { db } from '@/infrastructure/db/client';

export function makeStartPlacementTestUseCase(): IStartPlacementTestUseCase {
  return new StartPlacementTestUseCase(
    new DrizzlePlacementAttemptRepository(db),
    new DrizzlePlacementQuestionRepository(db),
  );
}
