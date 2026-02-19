import type { SpeakingSessionEntity } from '@/features/speaking/domain/entities/speaking-session.entity';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';
import type { ISpeakingTopicRepository } from '@/features/speaking/domain/repositories/speaking-topic-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

import type { CreateSpeakingSessionDto } from '../dto/create-speaking-session.dto';

export interface ICreateSpeakingSessionUseCase {
  execute(
    userId: string,
    dto: CreateSpeakingSessionDto,
  ): Promise<SpeakingSessionEntity>;
}

function durationSecondsForCefr(cefrLevel: string): number {
  const level = cefrLevel.toUpperCase().slice(0, 1);
  if (level === 'A') return 5 * 60;
  if (level === 'B') return 8 * 60;
  if (level === 'C') return 12 * 60;
  return 5 * 60;
}

export class CreateSpeakingSessionUseCase
  implements ICreateSpeakingSessionUseCase
{
  constructor(
    private readonly sessionRepo: ISpeakingSessionRepository,
    private readonly topicRepo: ISpeakingTopicRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateSpeakingSessionDto,
  ): Promise<SpeakingSessionEntity> {
    const topic = await this.topicRepo.findById(dto.topicId);
    if (!topic) {
      throw new NotFoundError(
        'Speaking topic not found.',
        'speaking.topicNotFound',
      );
    }
    const durationSeconds = durationSecondsForCefr(topic.cefrLevel);
    return this.sessionRepo.create({
      userId,
      topicId: dto.topicId,
      durationSeconds,
    });
  }
}
