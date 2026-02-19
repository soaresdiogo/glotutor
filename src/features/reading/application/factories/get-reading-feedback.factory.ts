import type { IGetReadingFeedbackUseCase } from '@/features/reading/application/use-cases/get-reading-feedback.use-case';
import { GetReadingFeedbackUseCase } from '@/features/reading/application/use-cases/get-reading-feedback.use-case';
import { OpenAIFeedbackService } from '@/features/reading/infrastructure/services/openai-feedback.service';

export function makeGetReadingFeedbackUseCase(): IGetReadingFeedbackUseCase {
  const openaiKey = process.env.OPENAI_API_KEY ?? '';
  return new GetReadingFeedbackUseCase(new OpenAIFeedbackService(openaiKey));
}
