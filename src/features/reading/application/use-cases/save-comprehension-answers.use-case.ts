import type { IReadingSessionRepository } from '@/features/reading/domain/repositories/reading-session-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

import type { SaveComprehensionAnswersDto } from '../dto/save-comprehension-answers.dto';

export interface ISaveComprehensionAnswersUseCase {
  execute(userId: string, dto: SaveComprehensionAnswersDto): Promise<void>;
}

export class SaveComprehensionAnswersUseCase
  implements ISaveComprehensionAnswersUseCase
{
  constructor(private readonly sessionRepo: IReadingSessionRepository) {}

  async execute(
    userId: string,
    dto: SaveComprehensionAnswersDto,
  ): Promise<void> {
    const updated = await this.sessionRepo.updateComprehensionAnswers(
      dto.sessionId,
      userId,
      dto.answers,
    );
    if (!updated) {
      throw new NotFoundError(
        'Session not found.',
        'reading.api.sessionNotFound',
      );
    }
  }
}
