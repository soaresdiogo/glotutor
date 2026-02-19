import type { SpeakingFeedbackEntity } from '@/features/speaking/domain/entities/speaking-session.entity';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';

export interface IGetSpeakingFeedbackUseCase {
  execute(
    userId: string,
    sessionId: string,
  ): Promise<SpeakingFeedbackEntity | null>;
}

export class GetSpeakingFeedbackUseCase implements IGetSpeakingFeedbackUseCase {
  constructor(private readonly sessionRepo: ISpeakingSessionRepository) {}

  async execute(
    userId: string,
    sessionId: string,
  ): Promise<SpeakingFeedbackEntity | null> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) return null;
    if (session.userId !== userId) return null;
    return session.feedback;
  }
}
