import type { IGetPronunciationUseCase } from '@/features/reading/application/use-cases/get-pronunciation.use-case';
import { GetPronunciationUseCase } from '@/features/reading/application/use-cases/get-pronunciation.use-case';
import { PronunciationService } from '@/features/reading/infrastructure/services/pronunciation.service';

export function makeGetPronunciationUseCase(): IGetPronunciationUseCase {
  return new GetPronunciationUseCase(new PronunciationService());
}
