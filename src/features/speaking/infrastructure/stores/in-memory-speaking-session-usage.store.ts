import type {
  ISpeakingSessionUsageStore,
  SpeakingSessionUsageSnapshot,
} from '@/features/speaking/domain/ports/speaking-session-usage-store.interface';

const _MAX_ENTRY_AGE_MS = 20 * 60 * 1000;

type Entry = { snapshot: SpeakingSessionUsageSnapshot; expiresAt: number };

export class InMemorySpeakingSessionUsageStore
  implements ISpeakingSessionUsageStore
{
  private readonly store = new Map<string, Entry>();

  private cleanExpired(): void {
    const now = Date.now();
    for (const [k, entry] of this.store.entries()) {
      if (entry.expiresAt < now) this.store.delete(k);
    }
  }

  async get(sessionId: string): Promise<SpeakingSessionUsageSnapshot | null> {
    this.cleanExpired();
    const entry = this.store.get(sessionId);
    if (!entry || entry.expiresAt < Date.now()) return null;
    return entry.snapshot;
  }

  async increment(
    sessionId: string,
    inputTokens: number,
    outputTokens: number,
    ttlSeconds: number,
    options?: { addTurn?: boolean },
  ): Promise<void> {
    this.cleanExpired();
    const current = await this.get(sessionId);
    const addTurn = options?.addTurn !== false;
    const snapshot: SpeakingSessionUsageSnapshot = {
      totalInputTokens: (current?.totalInputTokens ?? 0) + inputTokens,
      totalOutputTokens: (current?.totalOutputTokens ?? 0) + outputTokens,
      totalTurns: (current?.totalTurns ?? 0) + (addTurn ? 1 : 0),
    };
    this.store.set(sessionId, {
      snapshot,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}
