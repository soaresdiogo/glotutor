import type {
  FeedbackResult,
  IFeedbackAIService,
} from '@/features/reading/domain/ports/feedback-ai-service.interface';

import type { GetFeedbackDto } from '../dto/get-feedback.dto';

const POSITIVE_STATIC: FeedbackResult = {
  summary:
    'Excellent reading! You nailed this passage with clear pronunciation. Keep it up!',
  tips: ['Continue with slightly harder texts to keep challenging yourself.'],
  focusWords: [],
  nextSteps: ['Try an Advanced level text next.'],
};

export interface IGetReadingFeedbackUseCase {
  execute(dto: GetFeedbackDto): Promise<FeedbackResult>;
}

export class GetReadingFeedbackUseCase implements IGetReadingFeedbackUseCase {
  constructor(private readonly feedbackAI: IFeedbackAIService) {}

  async execute(dto: GetFeedbackDto): Promise<FeedbackResult> {
    const total =
      dto.greenCount + dto.yellowCount + dto.redCount + dto.missedCount;
    const accuracy = total > 0 ? (dto.greenCount / total) * 100 : 0;

    if (accuracy > 95 && dto.redCount === 0) {
      return POSITIVE_STATIC;
    }

    return this.feedbackAI.generateFeedback({
      wordScores: dto.wordScores,
      wpm: dto.wpm,
      level: dto.level,
      greenCount: dto.greenCount,
      yellowCount: dto.yellowCount,
      redCount: dto.redCount,
      missedCount: dto.missedCount,
    });
  }
}
