import type { IGetTopicExercisesUseCase } from '@/features/speaking/application/use-cases/get-topic-exercises.use-case';
import { GetTopicExercisesUseCase } from '@/features/speaking/application/use-cases/get-topic-exercises.use-case';
import { SpeakingExerciseRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-exercise.repository';
import { SpeakingTopicRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-topic.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetTopicExercisesUseCase(): IGetTopicExercisesUseCase {
  return new GetTopicExercisesUseCase(
    new SpeakingTopicRepository(db),
    new SpeakingExerciseRepository(db),
  );
}
