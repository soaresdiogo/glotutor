/**
 * Reset speaking session rate limit in Redis (for development / testing).
 *
 * Usage:
 *   npx tsx scripts/reset-speaking-rate-limit.ts              # reset ALL users' counters
 *   npx tsx scripts/reset-speaking-rate-limit.ts <userId>     # reset one user only
 *
 * Requires REDIS_URL in .env. Keys are: speaking:rate_limit:{userId}:{YYYY-MM-DD} (date in UTC).
 */

import * as path from 'node:path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const { getRedis } = await import('@/shared/lib/reading/redis-client');
  const client = getRedis();
  if (!client) {
    console.error('Redis not available (REDIS_URL missing or invalid).');
    process.exit(1);
  }

  const userId = process.argv[2];
  const pattern = userId
    ? `speaking:rate_limit:${userId}:*`
    : 'speaking:rate_limit:*';

  const keys = await client.keys(pattern);
  if (keys.length === 0) {
    console.log(`No keys found for pattern: ${pattern}`);
    process.exit(0);
  }

  await client.del(...keys);
  console.log(`Deleted ${keys.length} key(s):`);
  for (const k of keys) {
    console.log(`  - ${k}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
