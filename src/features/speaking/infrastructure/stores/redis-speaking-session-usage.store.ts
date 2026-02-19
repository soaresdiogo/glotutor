import type {
  ISpeakingSessionUsageStore,
  SpeakingSessionUsageSnapshot,
} from '@/features/speaking/domain/ports/speaking-session-usage-store.interface';
import { redisGet, redisSet } from '@/shared/lib/reading/redis-client';

const KEY_PREFIX = 'speaking:session:';
const KEY_SUFFIX = ':usage';

function key(sessionId: string): string {
  return `${KEY_PREFIX}${sessionId}${KEY_SUFFIX}`;
}

export class RedisSpeakingSessionUsageStore
  implements ISpeakingSessionUsageStore
{
  async get(sessionId: string): Promise<SpeakingSessionUsageSnapshot | null> {
    const raw = await redisGet(key(sessionId));
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as {
        totalInputTokens?: number;
        totalOutputTokens?: number;
        totalTurns?: number;
      };
      return {
        totalInputTokens: Number(data.totalInputTokens) || 0,
        totalOutputTokens: Number(data.totalOutputTokens) || 0,
        totalTurns: Number(data.totalTurns) || 0,
      };
    } catch {
      return null;
    }
  }

  async increment(
    sessionId: string,
    inputTokens: number,
    outputTokens: number,
    ttlSeconds: number,
    options?: { addTurn?: boolean },
  ): Promise<void> {
    const current = await this.get(sessionId);
    const addTurn = options?.addTurn !== false;
    const next = {
      totalInputTokens: (current?.totalInputTokens ?? 0) + inputTokens,
      totalOutputTokens: (current?.totalOutputTokens ?? 0) + outputTokens,
      totalTurns: (current?.totalTurns ?? 0) + (addTurn ? 1 : 0),
    };
    await redisSet(key(sessionId), JSON.stringify(next), ttlSeconds);
  }
}
