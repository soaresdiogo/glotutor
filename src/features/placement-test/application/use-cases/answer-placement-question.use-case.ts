import {
  buildAnswersByLevel,
  getAdaptiveDecision,
} from '@/features/placement-test/application/services/adaptive-placement.service';
import type { PlacementQuestionEntity } from '@/features/placement-test/domain/entities/placement-question.entity';
import type { IPlacementAnswerRepository } from '@/features/placement-test/domain/repositories/placement-answer.repository.interface';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import type { IPlacementQuestionRepository } from '@/features/placement-test/domain/repositories/placement-question.repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';

export type AnswerPlacementResult =
  | {
      kind: 'next';
      question: PlacementQuestionEntity;
      questionsAnswered: number;
    }
  | {
      kind: 'result';
      recommendedLevel: string;
      questionsAnswered: number;
      attemptId: string;
    };

export interface IAnswerPlacementQuestionUseCase {
  execute(
    userId: string,
    attemptId: string,
    questionId: string,
    selectedOptionIndex: number,
  ): Promise<AnswerPlacementResult>;
}

export class AnswerPlacementQuestionUseCase
  implements IAnswerPlacementQuestionUseCase
{
  constructor(
    private readonly attemptRepo: IPlacementAttemptRepository,
    private readonly questionRepo: IPlacementQuestionRepository,
    private readonly answerRepo: IPlacementAnswerRepository,
  ) {}

  async execute(
    userId: string,
    attemptId: string,
    questionId: string,
    selectedOptionIndex: number,
  ): Promise<AnswerPlacementResult> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundError(
        'Placement attempt not found.',
        'placementTest.attemptNotFound',
      );
    }
    if (attempt.status !== 'in_progress') {
      throw new BadRequestError(
        'This placement test is no longer in progress.',
        'placementTest.notInProgress',
      );
    }

    const question = await this.questionRepo.findById(questionId);
    if (!question) {
      throw new NotFoundError(
        'Placement question not found.',
        'placementTest.questionNotFound',
      );
    }
    if (question.language !== attempt.language) {
      throw new BadRequestError(
        'Question does not belong to this placement test.',
        'placementTest.questionMismatch',
      );
    }

    const isCorrect = question.correctOptionIndex === selectedOptionIndex;
    await this.answerRepo.create({
      attemptId,
      questionId,
      selectedOptionIndex,
      isCorrect,
      cefrLevel: question.cefrLevel,
    });

    const answers = await this.answerRepo.findByAttemptId(attemptId);
    const answersByLevel = buildAnswersByLevel(
      answers.map((a) => ({ cefrLevel: a.cefrLevel, isCorrect: a.isCorrect })),
    );
    const totalAnswered = answers.length;
    const currentLevel = question.cefrLevel;

    const decision = getAdaptiveDecision(
      answersByLevel,
      currentLevel,
      totalAnswered,
    );

    if (decision.done) {
      await this.attemptRepo.update(attemptId, {
        status: 'completed',
        recommendedLevel: decision.recommendedLevel,
        selectedLevel: decision.recommendedLevel,
        totalQuestions: totalAnswered,
        completedAt: new Date(),
      });
      return {
        kind: 'result',
        recommendedLevel: decision.recommendedLevel,
        questionsAnswered: totalAnswered,
        attemptId,
      };
    }

    const excludeIds = answers.map((a) => a.questionId);
    const nextQuestions = await this.questionRepo.findRandomByLanguageAndLevel(
      attempt.language,
      decision.nextLevel,
      1,
      excludeIds,
    );

    if (nextQuestions.length === 0) {
      const recommended = decision.nextLevel;
      await this.attemptRepo.update(attemptId, {
        status: 'completed',
        recommendedLevel: recommended,
        selectedLevel: recommended,
        totalQuestions: totalAnswered,
        completedAt: new Date(),
      });
      return {
        kind: 'result',
        recommendedLevel: recommended,
        questionsAnswered: totalAnswered,
        attemptId,
      };
    }

    await this.attemptRepo.update(attemptId, {
      totalQuestions: totalAnswered + 1,
    });

    return {
      kind: 'next',
      question: nextQuestions[0],
      questionsAnswered: totalAnswered,
    };
  }
}
