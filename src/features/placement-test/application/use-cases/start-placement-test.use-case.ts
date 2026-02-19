import { CEFR_LEVEL_ORDER } from '@/features/placement-test/domain/constants/cefr-levels';
import type { PlacementAttemptEntity } from '@/features/placement-test/domain/entities/placement-attempt.entity';
import type { PlacementQuestionEntity } from '@/features/placement-test/domain/entities/placement-question.entity';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import type { IPlacementQuestionRepository } from '@/features/placement-test/domain/repositories/placement-question.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'it', 'fr', 'de'] as const;

export interface IStartPlacementTestUseCase {
  execute(
    userId: string,
    language: string,
  ): Promise<{
    attempt: PlacementAttemptEntity;
    question: PlacementQuestionEntity;
  }>;
}

export class StartPlacementTestUseCase implements IStartPlacementTestUseCase {
  constructor(
    private readonly attemptRepo: IPlacementAttemptRepository,
    private readonly questionRepo: IPlacementQuestionRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
  ): Promise<{
    attempt: PlacementAttemptEntity;
    question: PlacementQuestionEntity;
  }> {
    const lang = language.toLowerCase();
    if (
      !SUPPORTED_LANGUAGES.includes(
        lang as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      throw new BadRequestError(
        'Unsupported language for placement test.',
        'placementTest.unsupportedLanguage',
      );
    }

    const inProgress = await this.attemptRepo.findInProgressByUserAndLanguage(
      userId,
      lang,
    );
    if (inProgress) {
      throw new BadRequestError(
        'A placement test is already in progress for this language.',
        'placementTest.alreadyInProgress',
      );
    }

    const questions = await this.questionRepo.findRandomByLanguageAndLevel(
      lang,
      CEFR_LEVEL_ORDER[0],
      1,
    );
    if (questions.length === 0) {
      throw new BadRequestError(
        'No placement questions available for this language and level.',
        'placementTest.noQuestions',
      );
    }

    const attempt = await this.attemptRepo.create({
      userId,
      language: lang,
      totalQuestions: 1,
    });

    return { attempt, question: questions[0] };
  }
}
