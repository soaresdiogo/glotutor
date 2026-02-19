import type { IGetReadingTextListUseCase } from '@/features/reading/application/use-cases/get-reading-text-list.use-case';
import { GetReadingTextListUseCase } from '@/features/reading/application/use-cases/get-reading-text-list.use-case';
import { ReadingTextListProvider } from '@/features/reading/infrastructure/services/reading-text-list.provider';

export function makeGetReadingTextListUseCase(): IGetReadingTextListUseCase {
  return new GetReadingTextListUseCase(new ReadingTextListProvider());
}
