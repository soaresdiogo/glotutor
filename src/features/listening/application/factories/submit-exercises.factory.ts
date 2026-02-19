import { env } from '@/env';
import type { ISubmitExercisesUseCase } from '@/features/listening/application/use-cases/submit-exercises.use-case';
import { SubmitExercisesUseCase } from '@/features/listening/application/use-cases/submit-exercises.use-case';
import { PodcastRepository } from '@/features/listening/infrastructure/drizzle-repositories/podcast.repository';
import { StudentPodcastProgressRepository } from '@/features/listening/infrastructure/drizzle-repositories/student-podcast-progress.repository';
import { OpenAIAIGateway } from '@/features/listening/infrastructure/gateways/openai-ai.gateway';
import { StudentListeningProfileProvider } from '@/features/listening/infrastructure/services/student-listening-profile.provider';
import { db } from '@/infrastructure/db/client';

export function makeSubmitExercisesUseCase(): ISubmitExercisesUseCase {
  return new SubmitExercisesUseCase(
    new PodcastRepository(db),
    new StudentPodcastProgressRepository(db),
    new OpenAIAIGateway(env.OPENAI_API_KEY ?? ''),
    new StudentListeningProfileProvider(),
  );
}
