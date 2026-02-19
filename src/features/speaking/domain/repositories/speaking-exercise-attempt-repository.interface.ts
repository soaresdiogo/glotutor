import type { SpeakingExerciseAttemptEntity } from '../entities/speaking-exercise-attempt.entity';

export interface ISpeakingExerciseAttemptRepository {
  create(data: {
    sessionId: string;
    exerciseId: string;
    userId: string;
    answer: string | string[] | Record<string, string> | null;
    isCorrect: boolean;
  }): Promise<SpeakingExerciseAttemptEntity>;

  findManyBySessionId(
    sessionId: string,
  ): Promise<SpeakingExerciseAttemptEntity[]>;
}
