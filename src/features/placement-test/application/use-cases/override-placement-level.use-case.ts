import { isValidCefrLevel } from '@/features/placement-test/domain/constants/cefr-levels';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';

export interface IOverridePlacementLevelUseCase {
  execute(
    userId: string,
    attemptId: string,
    selectedLevel: string,
  ): Promise<{ attemptId: string; selectedLevel: string }>;
}

export class OverridePlacementLevelUseCase
  implements IOverridePlacementLevelUseCase
{
  constructor(private readonly attemptRepo: IPlacementAttemptRepository) {}

  async execute(
    userId: string,
    attemptId: string,
    selectedLevel: string,
  ): Promise<{ attemptId: string; selectedLevel: string }> {
    const level = selectedLevel.toUpperCase();
    if (!isValidCefrLevel(level)) {
      throw new BadRequestError(
        'Invalid CEFR level.',
        'placementTest.invalidLevel',
      );
    }

    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundError(
        'Placement attempt not found.',
        'placementTest.attemptNotFound',
      );
    }
    if (attempt.status !== 'completed' && attempt.status !== 'skipped') {
      throw new BadRequestError(
        'Can only override level for a completed or skipped test.',
        'placementTest.cannotOverride',
      );
    }

    await this.attemptRepo.update(attemptId, { selectedLevel: level });
    return { attemptId, selectedLevel: level };
  }
}
