import type { IGetExerciseResultsUseCase } from '@/features/listening/application/use-cases/get-exercise-results.use-case';
import { GetExerciseResultsUseCase } from '@/features/listening/application/use-cases/get-exercise-results.use-case';
import { PodcastRepository } from '@/features/listening/infrastructure/drizzle-repositories/podcast.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetExerciseResultsUseCase(): IGetExerciseResultsUseCase {
  return new GetExerciseResultsUseCase(new PodcastRepository(db));
}
