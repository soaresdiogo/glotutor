import type { SpeakingExerciseEntity } from '../entities/speaking-exercise.entity';

export interface ISpeakingExerciseRepository {
  findManyByTopicId(topicId: string): Promise<SpeakingExerciseEntity[]>;
}
