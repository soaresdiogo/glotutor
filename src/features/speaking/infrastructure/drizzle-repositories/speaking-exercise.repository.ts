import { eq } from 'drizzle-orm';
import type { SpeakingExerciseEntity } from '@/features/speaking/domain/entities/speaking-exercise.entity';
import type { ISpeakingExerciseRepository } from '@/features/speaking/domain/repositories/speaking-exercise-repository.interface';
import { speakingExercises } from '@/infrastructure/db/schema/speaking-exercises';
import type { DbClient } from '@/infrastructure/db/types';

export class SpeakingExerciseRepository implements ISpeakingExerciseRepository {
  constructor(private readonly dbClient: DbClient) {}

  async findManyByTopicId(topicId: string): Promise<SpeakingExerciseEntity[]> {
    const rows = await this.dbClient.query.speakingExercises.findMany({
      where: eq(speakingExercises.topicId, topicId),
      orderBy: (t, { asc }) => [asc(t.questionNumber)],
    });

    return rows.map((r) => ({
      id: r.id,
      topicId: r.topicId,
      questionNumber: r.questionNumber,
      type: r.type as SpeakingExerciseEntity['type'],
      questionText: r.questionText,
      options: r.options,
      correctAnswer: r.correctAnswer,
      explanationText: r.explanationText,
    }));
  }
}
