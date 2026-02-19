import type { IGetSpeakingFeedbackUseCase } from '@/features/speaking/application/use-cases/get-speaking-feedback.use-case';
import { GetSpeakingFeedbackUseCase } from '@/features/speaking/application/use-cases/get-speaking-feedback.use-case';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetSpeakingFeedbackUseCase(): IGetSpeakingFeedbackUseCase {
  return new GetSpeakingFeedbackUseCase(new SpeakingSessionRepository(db));
}
