import { CEFR_LEVEL_ORDER } from '@/features/placement-test/domain/constants/cefr-levels';
import type { PlacementAttemptEntity } from '@/features/placement-test/domain/entities/placement-attempt.entity';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'it', 'fr', 'de'] as const;

export interface ISkipPlacementTestUseCase {
  execute(
    userId: string,
    language: string,
    selectedLevel?: string,
  ): Promise<PlacementAttemptEntity>;
}

export class SkipPlacementTestUseCase implements ISkipPlacementTestUseCase {
  constructor(private readonly attemptRepo: IPlacementAttemptRepository) {}

  async execute(
    userId: string,
    language: string,
    selectedLevel?: string,
  ): Promise<PlacementAttemptEntity> {
    const lang = language.toLowerCase();
    if (
      !SUPPORTED_LANGUAGES.includes(
        lang as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      throw new BadRequestError(
        'Unsupported language.',
        'placementTest.unsupportedLanguage',
      );
    }

    const inProgress = await this.attemptRepo.findInProgressByUserAndLanguage(
      userId,
      lang,
    );
    if (inProgress) {
      await this.attemptRepo.update(inProgress.id, {
        status: 'skipped',
        selectedLevel: selectedLevel ?? CEFR_LEVEL_ORDER[0],
        completedAt: new Date(),
      });
      return this.attemptRepo.findById(
        inProgress.id,
      ) as Promise<PlacementAttemptEntity>;
    }

    const attempt = await this.attemptRepo.create({
      userId,
      language: lang,
      totalQuestions: 0,
    });
    await this.attemptRepo.update(attempt.id, {
      status: 'skipped',
      selectedLevel: selectedLevel ?? CEFR_LEVEL_ORDER[0],
      completedAt: new Date(),
    });

    const updated = await this.attemptRepo.findById(attempt.id);
    if (!updated) throw new Error('Failed to create skip attempt');
    return updated;
  }
}
