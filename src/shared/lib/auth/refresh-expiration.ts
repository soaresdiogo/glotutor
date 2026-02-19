import { env } from '@/env';

function parseTimeSpanToMs(s: string): number {
  const match = /^(\d+)([dhms])$/i.exec(s.trim());
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Refresh token expiration from env (e.g. "7d", "24h").
 * Use this everywhere so JWT exp, session expiresAt, and cookie maxAge stay in sync.
 */
const RAW =
  (env as { JWT_REFRESH_TOKEN_EXPIRATION_TIME?: string })
    .JWT_REFRESH_TOKEN_EXPIRATION_TIME ?? '7d';

/** String for jose setExpirationTime (e.g. "7d") */
export const REFRESH_EXPIRATION_STRING = RAW.trim() || '7d';

/** Duration in milliseconds (for session expiresAt) */
export const REFRESH_EXPIRES_MS = parseTimeSpanToMs(REFRESH_EXPIRATION_STRING);

/** Duration in seconds (for cookie maxAge) */
export const REFRESH_EXPIRES_SECONDS = Math.floor(REFRESH_EXPIRES_MS / 1000);
