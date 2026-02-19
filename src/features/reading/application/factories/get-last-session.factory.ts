import type { IGetLastSessionUseCase } from '@/features/reading/application/use-cases/get-last-session.use-case';
import { GetLastSessionUseCase } from '@/features/reading/application/use-cases/get-last-session.use-case';
import { ReadingSessionRepository } from '@/features/reading/infrastructure/drizzle-repositories/reading-session.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetLastSessionUseCase(): IGetLastSessionUseCase {
  return new GetLastSessionUseCase(new ReadingSessionRepository(db));
}
