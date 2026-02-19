import type { IGetSessionResultsUseCase } from '@/features/speaking/application/use-cases/get-session-results.use-case';
import { GetSessionResultsUseCase } from '@/features/speaking/application/use-cases/get-session-results.use-case';
import { SpeakingExerciseRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-exercise.repository';
import { SpeakingExerciseAttemptRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-exercise-attempt.repository';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetSessionResultsUseCase(): IGetSessionResultsUseCase {
  return new GetSessionResultsUseCase(
    new SpeakingSessionRepository(db),
    new SpeakingExerciseRepository(db),
    new SpeakingExerciseAttemptRepository(db),
  );
}
