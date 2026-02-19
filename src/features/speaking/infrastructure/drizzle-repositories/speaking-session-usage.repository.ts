import type {
  CreateSpeakingSessionUsageDto,
  ISpeakingSessionUsageRepository,
} from '@/features/speaking/domain/repositories/speaking-session-usage-repository.interface';
import { speakingSessionUsage } from '@/infrastructure/db/schema/speaking-session-usage';
import type { DbClient } from '@/infrastructure/db/types';

export class SpeakingSessionUsageRepository
  implements ISpeakingSessionUsageRepository
{
  constructor(private readonly db: DbClient) {}

  async create(data: CreateSpeakingSessionUsageDto): Promise<void> {
    await this.db.insert(speakingSessionUsage).values({
      sessionId: data.sessionId,
      userId: data.userId,
      totalTurns: data.totalTurns,
      totalInputTokens: data.totalInputTokens,
      totalOutputTokens: data.totalOutputTokens,
      estimatedCostUsd: data.estimatedCostUsd,
      durationSeconds: data.durationSeconds,
    });
  }
}
