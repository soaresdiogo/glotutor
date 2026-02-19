import type { SpeakingFeedbackEntity } from '@/features/speaking/domain/entities/speaking-session.entity';
import type { ISpeakingFeedbackAIGateway } from '@/features/speaking/domain/ports/speaking-feedback-ai.interface';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

import type { SubmitSpeakingFeedbackDto } from '../dto/speaking-feedback.dto';

export interface IGenerateSpeakingFeedbackUseCase {
  execute(
    userId: string,
    dto: SubmitSpeakingFeedbackDto,
  ): Promise<SpeakingFeedbackEntity>;
}

export class GenerateSpeakingFeedbackUseCase
  implements IGenerateSpeakingFeedbackUseCase
{
  constructor(
    private readonly sessionRepo: ISpeakingSessionRepository,
    private readonly feedbackGateway: ISpeakingFeedbackAIGateway,
  ) {}

  async execute(
    userId: string,
    dto: SubmitSpeakingFeedbackDto,
  ): Promise<SpeakingFeedbackEntity> {
    const session = await this.sessionRepo.findByIdWithTopic(dto.sessionId);
    if (!session) {
      throw new NotFoundError(
        'Speaking session not found.',
        'speaking.sessionNotFound',
      );
    }
    if (session.userId !== userId) {
      throw new NotFoundError(
        'Speaking session not found.',
        'speaking.sessionNotFound',
      );
    }

    const feedback = await this.feedbackGateway.generateFeedback({
      transcript: dto.transcript,
      targetLanguage: session.topic.languageCode ?? 'en',
      nativeLanguage: 'en',
      cefrLevel: session.topic.cefrLevel,
      topicTitle: session.topic.title,
    });

    await this.sessionRepo.updateCompleted(dto.sessionId, feedback);
    return feedback;
  }
}
