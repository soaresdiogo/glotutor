import {
  redisExpire,
  redisGet,
  redisIncr,
} from '@/shared/lib/reading/redis-client';

const DEFAULT_DAILY_LIMIT = 5;

function dateKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** TTL in seconds: until end of current UTC day + 1 hour buffer. */
function ttlUntilEndOfDay(): number {
  const now = new Date();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return Math.ceil((end.getTime() - now.getTime()) / 1000) + 3600;
}

export type SpeakingRateLimitResult = {
  allowed: boolean;
  remaining: number;
  dailyLimit: number;
  currentCount: number;
};

/**
 * Increment speaking session count for the user for today (UTC).
 * Returns allowed, remaining sessions, daily limit, and current count.
 * If Redis is unavailable, allows the request and returns remaining = dailyLimit.
 *
 * Storage: Redis only (no DB table). Key: speaking:rate_limit:{userId}:{YYYY-MM-DD}.
 * To reset in dev: npx tsx scripts/reset-speaking-rate-limit.ts [userId]
 */
export async function checkSpeakingSessionRateLimit(
  userId: string,
  dailyLimit?: number,
): Promise<SpeakingRateLimitResult> {
  const limit = dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const key = `speaking:rate_limit:${userId}:${dateKey()}`;

  const count = await redisIncr(key);
  if (count === null) {
    return {
      allowed: true,
      remaining: limit,
      dailyLimit: limit,
      currentCount: 0,
    };
  }
  if (count === 1) {
    await redisExpire(key, ttlUntilEndOfDay());
  }

  const remaining = Math.max(0, limit - count);
  return {
    allowed: count <= limit,
    remaining,
    dailyLimit: limit,
    currentCount: count,
  };
}

/**
 * Get current remaining sessions and daily limit without incrementing.
 * Use for displaying "X of Y remaining" before starting a session.
 */
export async function getSpeakingSessionLimitStatus(
  userId: string,
  dailyLimit?: number,
): Promise<{ remainingSessions: number; dailyLimit: number }> {
  const limit = dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const key = `speaking:rate_limit:${userId}:${dateKey()}`;
  const raw = await redisGet(key);
  const count = raw != null ? Number.parseInt(raw, 10) : 0;
  const remaining = Math.max(0, limit - count);
  return { remainingSessions: remaining, dailyLimit: limit };
}
