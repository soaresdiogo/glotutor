import type { ISpeakingSessionUsageStore } from '@/features/speaking/domain/ports/speaking-session-usage-store.interface';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';
import type { ISpeakingSessionUsageRepository } from '@/features/speaking/domain/repositories/speaking-session-usage-repository.interface';
import { ForbiddenError, NotFoundError } from '@/shared/lib/errors';

import { calculateOpenAICost } from '../constants/openai-cost';
import type { CompleteSpeakingSessionDto } from '../dto/complete-speaking-session.dto';

export interface ICompleteSpeakingSessionUseCase {
  execute(userId: string, dto: CompleteSpeakingSessionDto): Promise<void>;
}

export class CompleteSpeakingSessionUseCase
  implements ICompleteSpeakingSessionUseCase
{
  constructor(
    private readonly sessionRepo: ISpeakingSessionRepository,
    private readonly usageStore: ISpeakingSessionUsageStore,
    private readonly usageRepo: ISpeakingSessionUsageRepository,
  ) {}

  async execute(
    userId: string,
    dto: CompleteSpeakingSessionDto,
  ): Promise<void> {
    const session = await this.sessionRepo.findById(dto.sessionId);
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
    const maxAllowedMs = session.durationSeconds * 1000;
    const graceMs = 30_000; // 30s grace when completing via timer expiry
    const elapsedMs = Date.now() - session.startedAt.getTime();
    if (elapsedMs > maxAllowedMs + graceMs) {
      throw new ForbiddenError(
        'Session duration exceeded. Please start a new session.',
        'speaking.sessionDurationExceeded',
      );
    }

    const usage = await this.usageStore.get(dto.sessionId);
    if (
      usage &&
      (usage.totalTurns > 0 ||
        usage.totalInputTokens > 0 ||
        usage.totalOutputTokens > 0)
    ) {
      const durationSeconds = Math.floor(
        (Date.now() - session.startedAt.getTime()) / 1000,
      );
      const estimatedCostUsd = calculateOpenAICost({
        inputTokens: usage.totalInputTokens,
        outputTokens: usage.totalOutputTokens,
        model: 'gpt-4o-mini',
      });
      try {
        await this.usageRepo.create({
          sessionId: dto.sessionId,
          userId,
          totalTurns: usage.totalTurns,
          totalInputTokens: usage.totalInputTokens,
          totalOutputTokens: usage.totalOutputTokens,
          estimatedCostUsd,
          durationSeconds,
        });
        console.info(
          '[Speaking][Usage]',
          `sessionId=${dto.sessionId} turns=${usage.totalTurns} inputTokens=${usage.totalInputTokens} outputTokens=${usage.totalOutputTokens} estimatedCost=${estimatedCostUsd} durationSeconds=${durationSeconds}`,
        );
      } catch (e) {
        console.warn('[Speaking][Usage] Failed to persist usage:', e);
      }
    }

    await this.sessionRepo.updateStatus(dto.sessionId, 'completed');
  }
}
