import type { IPlacementAnswerRepository } from '@/features/placement-test/domain/repositories/placement-answer.repository.interface';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';
import {
  buildAnswersByLevel,
  getAdaptiveDecision,
} from '../services/adaptive-placement.service';

export interface ICompletePlacementTestUseCase {
  execute(
    userId: string,
    attemptId: string,
  ): Promise<{
    recommendedLevel: string;
    attemptId: string;
  }>;
}

export class CompletePlacementTestUseCase
  implements ICompletePlacementTestUseCase
{
  constructor(
    private readonly attemptRepo: IPlacementAttemptRepository,
    private readonly answerRepo: IPlacementAnswerRepository,
  ) {}

  async execute(
    userId: string,
    attemptId: string,
  ): Promise<{ recommendedLevel: string; attemptId: string }> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundError(
        'Placement attempt not found.',
        'placementTest.attemptNotFound',
      );
    }
    if (attempt.status !== 'in_progress') {
      throw new BadRequestError(
        'This placement test is not in progress.',
        'placementTest.notInProgress',
      );
    }

    const answers = await this.answerRepo.findByAttemptId(attemptId);
    if (answers.length === 0) {
      throw new BadRequestError(
        'Cannot complete placement test with no answers.',
        'placementTest.noAnswers',
      );
    }

    const answersByLevel = buildAnswersByLevel(
      answers.map((a) => ({ cefrLevel: a.cefrLevel, isCorrect: a.isCorrect })),
    );
    const lastLevel =
      answers.length > 0 ? answers[answers.length - 1].cefrLevel : 'A1';
    const decision = getAdaptiveDecision(
      answersByLevel,
      lastLevel,
      answers.length,
    );

    const recommendedLevel = decision.done
      ? decision.recommendedLevel
      : lastLevel;

    await this.attemptRepo.update(attemptId, {
      status: 'completed',
      recommendedLevel,
      selectedLevel: recommendedLevel,
      totalQuestions: answers.length,
      completedAt: new Date(),
    });

    return { attemptId, recommendedLevel };
  }
}
