import type { IReadingSessionRepository } from '@/features/reading/domain/repositories/reading-session-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

import type { SaveSessionFeedbackDto } from '../dto/save-session-feedback.dto';

export interface ISaveSessionFeedbackUseCase {
  execute(userId: string, dto: SaveSessionFeedbackDto): Promise<void>;
}

export class SaveSessionFeedbackUseCase implements ISaveSessionFeedbackUseCase {
  constructor(private readonly sessionRepo: IReadingSessionRepository) {}

  async execute(userId: string, dto: SaveSessionFeedbackDto): Promise<void> {
    const updated = await this.sessionRepo.updateFeedback(
      dto.sessionId,
      userId,
      dto.feedback,
      dto.grammarItems,
    );
    if (!updated) {
      throw new NotFoundError(
        'Session not found.',
        'reading.api.sessionNotFound',
      );
    }
  }
}
