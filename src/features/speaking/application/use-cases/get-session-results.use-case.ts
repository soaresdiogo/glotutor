import type { SpeakingExerciseEntity } from '@/features/speaking/domain/entities/speaking-exercise.entity';
import type { SpeakingExerciseAttemptEntity } from '@/features/speaking/domain/entities/speaking-exercise-attempt.entity';
import type { SpeakingFeedbackEntity } from '@/features/speaking/domain/entities/speaking-session.entity';
import type { ISpeakingExerciseAttemptRepository } from '@/features/speaking/domain/repositories/speaking-exercise-attempt-repository.interface';
import type { ISpeakingExerciseRepository } from '@/features/speaking/domain/repositories/speaking-exercise-repository.interface';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';

export type SessionResultsEntity = {
  sessionId: string;
  topicTitle: string;
  topicSlug: string;
  cefrLevel: string;
  feedback: SpeakingFeedbackEntity | null;
  exercises: Array<
    SpeakingExerciseEntity & {
      attempt: SpeakingExerciseAttemptEntity | null;
    }
  >;
  exerciseScore: { correct: number; total: number };
};

export interface IGetSessionResultsUseCase {
  execute(
    userId: string,
    sessionId: string,
  ): Promise<SessionResultsEntity | null>;
}

export class GetSessionResultsUseCase implements IGetSessionResultsUseCase {
  constructor(
    private readonly sessionRepo: ISpeakingSessionRepository,
    private readonly exerciseRepo: ISpeakingExerciseRepository,
    private readonly attemptRepo: ISpeakingExerciseAttemptRepository,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
  ): Promise<SessionResultsEntity | null> {
    const session = await this.sessionRepo.findByIdWithTopic(sessionId);
    if (!session) return null;
    if (session.userId !== userId) return null;

    const exercises = await this.exerciseRepo.findManyByTopicId(
      session.topicId,
    );
    const attempts = await this.attemptRepo.findManyBySessionId(sessionId);
    const attemptsByExercise = new Map(attempts.map((a) => [a.exerciseId, a]));

    const exercisesWithAttempts = exercises.map((ex) => ({
      ...ex,
      attempt: attemptsByExercise.get(ex.id) ?? null,
    }));

    const correct = attempts.filter((a) => a.isCorrect).length;
    const total = exercises.length;

    return {
      sessionId,
      topicTitle: session.topic.title,
      topicSlug: session.topic.slug,
      cefrLevel: session.topic.cefrLevel,
      feedback: session.feedback,
      exercises: exercisesWithAttempts,
      exerciseScore: { correct, total },
    };
  }
}
