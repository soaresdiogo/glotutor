import type { SpeakingExerciseAttemptEntity } from '@/features/speaking/domain/entities/speaking-exercise-attempt.entity';
import type { ISpeakingExerciseAttemptRepository } from '@/features/speaking/domain/repositories/speaking-exercise-attempt-repository.interface';
import type { ISpeakingExerciseRepository } from '@/features/speaking/domain/repositories/speaking-exercise-repository.interface';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

import type { SubmitExerciseAttemptDto } from '../dto/submit-exercise-attempt.dto';
import { evaluateExercise } from '../services/exercise-evaluator';

export interface ISubmitExerciseAttemptUseCase {
  execute(
    userId: string,
    dto: SubmitExerciseAttemptDto,
  ): Promise<{
    attempt: SpeakingExerciseAttemptEntity;
    correct: boolean;
    hint?: string;
  }>;
}

export class SubmitExerciseAttemptUseCase
  implements ISubmitExerciseAttemptUseCase
{
  constructor(
    private readonly sessionRepo: ISpeakingSessionRepository,
    private readonly exerciseRepo: ISpeakingExerciseRepository,
    private readonly attemptRepo: ISpeakingExerciseAttemptRepository,
  ) {}

  async execute(
    userId: string,
    dto: SubmitExerciseAttemptDto,
  ): Promise<{
    attempt: SpeakingExerciseAttemptEntity;
    correct: boolean;
    hint?: string;
  }> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) {
      throw new NotFoundError(
        'Speaking session not found.',
        'speaking.sessionNotFound',
      );
    }
    if (session.userId !== userId) {
      throw new NotFoundError(
        'Speaking session not found.',
        'speaking.sessionNotFound',
      );
    }

    const exercises = await this.exerciseRepo.findManyByTopicId(
      session.topicId,
    );
    const exercise = exercises.find((e) => e.id === dto.exerciseId);
    if (!exercise) {
      throw new NotFoundError(
        'Exercise not found.',
        'speaking.exerciseNotFound',
      );
    }

    const evaluation = evaluateExercise(
      exercise.type,
      exercise.correctAnswer,
      dto.answer,
    );
    const attempt = await this.attemptRepo.create({
      sessionId: dto.sessionId,
      exerciseId: dto.exerciseId,
      userId,
      answer: dto.answer,
      isCorrect: evaluation.correct,
    });

    return {
      attempt,
      correct: evaluation.correct,
      hint: evaluation.hint,
    };
  }
}
