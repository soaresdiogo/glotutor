import type { ISaveSessionFeedbackUseCase } from '@/features/reading/application/use-cases/save-session-feedback.use-case';
import { SaveSessionFeedbackUseCase } from '@/features/reading/application/use-cases/save-session-feedback.use-case';
import { ReadingSessionRepository } from '@/features/reading/infrastructure/drizzle-repositories/reading-session.repository';

import { db } from '@/infrastructure/db/client';

export function makeSaveSessionFeedbackUseCase(): ISaveSessionFeedbackUseCase {
  return new SaveSessionFeedbackUseCase(new ReadingSessionRepository(db));
}
