import type { ISpeakingSessionUsageStore } from '@/features/speaking/domain/ports/speaking-session-usage-store.interface';

const FALLBACK_WARNING =
  '[Speaking] Redis session usage store unavailable, using in-memory fallback';

export class ResilientSpeakingSessionUsageStore
  implements ISpeakingSessionUsageStore
{
  constructor(
    private readonly primary: ISpeakingSessionUsageStore,
    private readonly fallback: ISpeakingSessionUsageStore,
  ) {}

  async get(sessionId: string) {
    try {
      return await this.primary.get(sessionId);
    } catch {
      console.warn(FALLBACK_WARNING);
      return await this.fallback.get(sessionId);
    }
  }

  async increment(
    sessionId: string,
    inputTokens: number,
    outputTokens: number,
    ttlSeconds: number,
    options?: { addTurn?: boolean },
  ): Promise<void> {
    try {
      await this.primary.increment(
        sessionId,
        inputTokens,
        outputTokens,
        ttlSeconds,
        options,
      );
    } catch {
      console.warn(FALLBACK_WARNING);
      await this.fallback.increment(
        sessionId,
        inputTokens,
        outputTokens,
        ttlSeconds,
        options,
      );
    }
  }
}
