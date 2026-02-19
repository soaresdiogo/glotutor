import type { IGetProgressUseCase } from '@/features/progress/application/use-cases/get-progress.use-case';
import { GetProgressUseCase } from '@/features/progress/application/use-cases/get-progress.use-case';
import { ProgressRepository } from '@/features/progress/infrastructure/drizzle-repositories/progress.repository';
import { db } from '@/infrastructure/db/client';

export function makeGetProgressUseCase(): IGetProgressUseCase {
  return new GetProgressUseCase(new ProgressRepository(db));
}
