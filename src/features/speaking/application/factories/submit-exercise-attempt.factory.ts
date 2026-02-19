import type { ISubmitExerciseAttemptUseCase } from '@/features/speaking/application/use-cases/submit-exercise-attempt.use-case';
import { SubmitExerciseAttemptUseCase } from '@/features/speaking/application/use-cases/submit-exercise-attempt.use-case';
import { SpeakingExerciseRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-exercise.repository';
import { SpeakingExerciseAttemptRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-exercise-attempt.repository';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';

import { db } from '@/infrastructure/db/client';

export function makeSubmitExerciseAttemptUseCase(): ISubmitExerciseAttemptUseCase {
  return new SubmitExerciseAttemptUseCase(
    new SpeakingSessionRepository(db),
    new SpeakingExerciseRepository(db),
    new SpeakingExerciseAttemptRepository(db),
  );
}
