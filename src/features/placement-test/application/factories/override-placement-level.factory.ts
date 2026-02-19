import type { IOverridePlacementLevelUseCase } from '@/features/placement-test/application/use-cases/override-placement-level.use-case';
import { OverridePlacementLevelUseCase } from '@/features/placement-test/application/use-cases/override-placement-level.use-case';
import { DrizzlePlacementAttemptRepository } from '@/features/placement-test/infrastructure/drizzle-repositories/placement-attempt.repository';
import { db } from '@/infrastructure/db/client';

export function makeOverridePlacementLevelUseCase(): IOverridePlacementLevelUseCase {
  return new OverridePlacementLevelUseCase(
    new DrizzlePlacementAttemptRepository(db),
  );
}
