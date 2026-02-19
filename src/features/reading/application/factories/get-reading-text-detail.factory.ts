import type { IGetReadingTextDetailUseCase } from '@/features/reading/application/use-cases/get-reading-text-detail.use-case';
import { GetReadingTextDetailUseCase } from '@/features/reading/application/use-cases/get-reading-text-detail.use-case';
import { TextRepository } from '@/features/reading/infrastructure/drizzle-repositories/text.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetReadingTextDetailUseCase(): IGetReadingTextDetailUseCase {
  return new GetReadingTextDetailUseCase(new TextRepository(db));
}
