import { eq } from 'drizzle-orm';
import type { SpeakingExerciseAttemptEntity } from '@/features/speaking/domain/entities/speaking-exercise-attempt.entity';
import type { ISpeakingExerciseAttemptRepository } from '@/features/speaking/domain/repositories/speaking-exercise-attempt-repository.interface';
import { speakingExerciseAttempts } from '@/infrastructure/db/schema/speaking-exercise-attempts';
import type { DbClient } from '@/infrastructure/db/types';

export class SpeakingExerciseAttemptRepository
  implements ISpeakingExerciseAttemptRepository
{
  constructor(private readonly dbClient: DbClient) {}

  async create(data: {
    sessionId: string;
    exerciseId: string;
    userId: string;
    answer: string | string[] | Record<string, string> | null;
    isCorrect: boolean;
  }): Promise<SpeakingExerciseAttemptEntity> {
    const [inserted] = await this.dbClient
      .insert(speakingExerciseAttempts)
      .values({
        sessionId: data.sessionId,
        exerciseId: data.exerciseId,
        userId: data.userId,
        answer: data.answer,
        isCorrect: data.isCorrect,
      })
      .returning();
    if (!inserted)
      throw new Error('Failed to create speaking exercise attempt');
    return {
      id: inserted.id,
      sessionId: inserted.sessionId,
      exerciseId: inserted.exerciseId,
      userId: inserted.userId,
      answer: inserted.answer as SpeakingExerciseAttemptEntity['answer'],
      isCorrect: inserted.isCorrect,
      createdAt: inserted.createdAt,
    };
  }

  async findManyBySessionId(
    sessionId: string,
  ): Promise<SpeakingExerciseAttemptEntity[]> {
    const rows = await this.dbClient.query.speakingExerciseAttempts.findMany({
      where: eq(speakingExerciseAttempts.sessionId, sessionId),
    });

    return rows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      exerciseId: r.exerciseId,
      userId: r.userId,
      answer: r.answer as SpeakingExerciseAttemptEntity['answer'],
      isCorrect: r.isCorrect,
      createdAt: r.createdAt,
    }));
  }
}
