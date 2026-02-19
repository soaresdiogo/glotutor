export type SpeakingSessionUsageSnapshot = {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTurns: number;
};

/**
 * Accumulates token usage and turn count per session (Redis or in-memory).
 * Used to persist usage to DB on session expiration or completion.
 */
export interface ISpeakingSessionUsageStore {
  get(sessionId: string): Promise<SpeakingSessionUsageSnapshot | null>;
  /**
   * Add token usage. When addTurn is true (default), also increments totalTurns by 1.
   */
  increment(
    sessionId: string,
    inputTokens: number,
    outputTokens: number,
    ttlSeconds: number,
    options?: { addTurn?: boolean },
  ): Promise<void>;
}
