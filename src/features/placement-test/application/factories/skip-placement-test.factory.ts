import type { ISkipPlacementTestUseCase } from '@/features/placement-test/application/use-cases/skip-placement-test.use-case';
import { SkipPlacementTestUseCase } from '@/features/placement-test/application/use-cases/skip-placement-test.use-case';
import { DrizzlePlacementAttemptRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-attempt.repository';
import { db } from '@/infrastructure/db/client';

export function makeSkipPlacementTestUseCase(): ISkipPlacementTestUseCase {
  return new SkipPlacementTestUseCase(
    new DrizzlePlacementAttemptRepository(db),
  );
}
