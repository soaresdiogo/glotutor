import type { ICreateSpeakingSessionUseCase } from '@/features/speaking/application/use-cases/create-speaking-session.use-case';
import { CreateSpeakingSessionUseCase } from '@/features/speaking/application/use-cases/create-speaking-session.use-case';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';
import { SpeakingTopicRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-topic.repository';

import { db } from '@/infrastructure/db/client';

export function makeCreateSpeakingSessionUseCase(): ICreateSpeakingSessionUseCase {
  return new CreateSpeakingSessionUseCase(
    new SpeakingSessionRepository(db),
    new SpeakingTopicRepository(db),
  );
}
