import { redisExpire, redisIncr } from './redis-client';

const LIMITS = {
  evaluate: { max: 20, windowSeconds: 3600 },
  pronunciation: { max: 100, windowSeconds: 3600 },
  feedback: { max: 20, windowSeconds: 3600 },
  grammarAnalysis: { max: 10, windowSeconds: 3600 },
} as const;

export async function checkRateLimit(
  prefix: string,
  userId: string,
  kind: keyof typeof LIMITS,
): Promise<{ allowed: boolean; remaining: number }> {
  const { max, windowSeconds } = LIMITS[kind];
  const key = `reading:${prefix}:${kind}:${userId}`;
  const count = await redisIncr(key);
  if (count === null) return { allowed: true, remaining: max };
  if (count === 1) await redisExpire(key, windowSeconds);
  const remaining = Math.max(0, max - count);
  return { allowed: count <= max, remaining };
}
