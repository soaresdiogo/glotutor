import type { ISaveComprehensionAnswersUseCase } from '@/features/reading/application/use-cases/save-comprehension-answers.use-case';
import { SaveComprehensionAnswersUseCase } from '@/features/reading/application/use-cases/save-comprehension-answers.use-case';
import { ReadingSessionRepository } from '@/features/reading/infrastructure/drizzle-repositories/reading-session.repository';

import { db } from '@/infrastructure/db/client';

export function makeSaveComprehensionAnswersUseCase(): ISaveComprehensionAnswersUseCase {
  return new SaveComprehensionAnswersUseCase(new ReadingSessionRepository(db));
}
