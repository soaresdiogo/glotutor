import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis !== null) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redis = new Redis(url);
    redis.on('error', () => {
      redis = null;
    });
    return redis;
  } catch {
    return null;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  try {
    if (ttlSeconds == null) await client.set(key, value);
    else await client.setex(key, ttlSeconds, value);
    return true;
  } catch {
    return false;
  }
}

export async function redisIncr(key: string): Promise<number | null> {
  const client = getRedis();
  if (!client) return 0;
  try {
    return await client.incr(key);
  } catch {
    return null;
  }
}

export async function redisExpire(
  key: string,
  ttlSeconds: number,
): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  try {
    await client.expire(key, ttlSeconds);
    return true;
  } catch {
    return false;
  }
}

export async function redisDel(key: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  try {
    await client.del(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete all keys matching a pattern (e.g. "reading:texts:*").
 * Use when invalidating all reading texts cache after generating new content.
 */
export async function redisDelByPattern(pattern: string): Promise<number> {
  const client = getRedis();
  if (!client) return 0;
  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    await client.del(...keys);
    return keys.length;
  } catch {
    return 0;
  }
}

/**
 * Invalidate all reading texts cache. Call after saving new reading content.
 */
export async function invalidateReadingTextsCache(): Promise<number> {
  return redisDelByPattern('reading:texts:*');
}
