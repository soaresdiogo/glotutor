import { createPrivateKey } from 'node:crypto';
import * as jose from 'jose';
import { env } from '@/env';
import { REFRESH_EXPIRATION_STRING } from '@/shared/lib/auth/refresh-expiration';

export type AccessTokenPayload = {
  type: 'access';
  sub: string;
  accountId: string | null;
  tenantId: string | null;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

export type RefreshTokenPayload = {
  type: 'refresh';
  sub: string;
  tenantId: string | null;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

export type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

/**
 * Get PEM string from env value. Supports:
 * - Raw PEM (with -----BEGIN ... -----)
 * - Base64-encoded PEM (no newline/escaping issues in .env)
 */
function pemFromEnv(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('-----BEGIN ')) {
    return trimmed
      .replaceAll(String.raw`\n`, '\n')
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n')
      .trim();
  }
  try {
    return Buffer.from(trimmed, 'base64').toString('utf-8').trim();
  } catch {
    return trimmed;
  }
}

/** Convert PEM to PKCS#8 if it's PKCS#1 (RSA PRIVATE KEY), so jose can use it. */
function ensurePkcs8PrivatePem(pem: string): string {
  if (pem.includes('BEGIN PRIVATE KEY')) return pem;
  if (pem.includes('BEGIN RSA PRIVATE KEY')) {
    const key = createPrivateKey({ key: pem, format: 'pem' });
    const exported = key.export({ type: 'pkcs8', format: 'pem' });
    return typeof exported === 'string' ? exported : exported.toString();
  }
  return pem;
}

async function getKeyPair() {
  const envServer = env as {
    JWT_PRIVATE_KEY?: string;
    JWT_PUBLIC_KEY?: string;
  };
  let privatePem = pemFromEnv(envServer.JWT_PRIVATE_KEY ?? '');
  const publicPem = pemFromEnv(envServer.JWT_PUBLIC_KEY ?? '');
  if (!privatePem || !publicPem) {
    throw new Error(
      'JWT keys not configured. Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY (or PRIVATE_KEY and PUBLIC_KEY).',
    );
  }
  privatePem = ensurePkcs8PrivatePem(privatePem);
  let privateKey: Awaited<ReturnType<typeof jose.importPKCS8>>;
  try {
    privateKey = await jose.importPKCS8(privatePem, 'RS256');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const newlinePlaceholder = String.raw`\n`;
    const hint = `Ensure JWT_PRIVATE_KEY is PEM (-----BEGIN PRIVATE KEY----- or -----BEGIN RSA PRIVATE KEY-----) or base64-encoded PEM. For raw PEM in .env use ${newlinePlaceholder} for newlines.`;
    throw new Error(`JWT private key is invalid: ${msg}. ${hint}`);
  }
  let publicKey: Awaited<ReturnType<typeof jose.importSPKI>>;
  try {
    publicKey = await jose.importSPKI(publicPem, 'RS256');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `JWT public key is invalid: ${msg}. Ensure JWT_PUBLIC_KEY is a PEM string starting with -----BEGIN PUBLIC KEY-----.`,
    );
  }
  return { privateKey, publicKey };
}

export async function generateAccessToken(payload: {
  sub: string;
  accountId: string | null;
  tenantId: string | null;
}): Promise<string> {
  const { privateKey } = await getKeyPair();
  const iss = (env as { JWT_ISSUER?: string }).JWT_ISSUER ?? 'glotutor';
  const aud = (env as { JWT_AUDIENCE?: string }).JWT_AUDIENCE ?? 'glotutor';
  const exp =
    (env as { JWT_ACCESS_TOKEN_EXPIRATION_TIME?: string })
      .JWT_ACCESS_TOKEN_EXPIRATION_TIME ?? '15m';

  return new jose.SignJWT({
    type: 'access',
    ...payload,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(iss)
    .setAudience(aud)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(privateKey);
}

export async function generateRefreshToken(payload: {
  sub: string;
  tenantId: string | null;
}): Promise<string> {
  const { privateKey } = await getKeyPair();
  const iss = (env as { JWT_ISSUER?: string }).JWT_ISSUER ?? 'glotutor';
  const aud = (env as { JWT_AUDIENCE?: string }).JWT_AUDIENCE ?? 'glotutor';

  return new jose.SignJWT({
    type: 'refresh',
    ...payload,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(iss)
    .setAudience(aud)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRATION_STRING)
    .sign(privateKey);
}

export async function verifyToken(
  token: string,
): Promise<{ payload: TokenPayload }> {
  const { publicKey } = await getKeyPair();
  const iss = (env as { JWT_ISSUER?: string }).JWT_ISSUER ?? 'glotutor';
  const aud = (env as { JWT_AUDIENCE?: string }).JWT_AUDIENCE ?? 'glotutor';

  const { payload } = await jose.jwtVerify(token, publicKey, {
    issuer: iss,
    audience: aud,
  });

  return { payload: payload as unknown as TokenPayload };
}

const PAYMENT_LINK_AUDIENCE = 'glotutor/payment-link';
const PAYMENT_LINK_EXPIRATION = '1h';

export type PaymentLinkTokenPayload = {
  type: 'payment-link';
  email: string;
  fullName: string;
  planType: string;
  currency?: string;
  interval?: 'month' | 'annual';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

export async function signPaymentLinkToken(payload: {
  email: string;
  fullName: string;
  planType: string;
  currency?: string;
  interval?: 'month' | 'annual';
}): Promise<string> {
  const { privateKey } = await getKeyPair();
  const iss = (env as { JWT_ISSUER?: string }).JWT_ISSUER ?? 'glotutor';

  const body: Record<string, unknown> = {
    type: 'payment-link',
    email: payload.email.toLowerCase(),
    fullName: payload.fullName,
    planType: payload.planType,
  };
  if (payload.currency != null && payload.currency.length > 0) {
    body.currency = payload.currency;
  }
  if (payload.interval != null) {
    body.interval = payload.interval;
  }

  return new jose.SignJWT(body)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(iss)
    .setAudience(PAYMENT_LINK_AUDIENCE)
    .setSubject(payload.email.toLowerCase())
    .setIssuedAt()
    .setExpirationTime(PAYMENT_LINK_EXPIRATION)
    .sign(privateKey);
}

export async function verifyPaymentLinkToken(
  token: string,
): Promise<{ payload: PaymentLinkTokenPayload }> {
  const { publicKey } = await getKeyPair();
  const iss = (env as { JWT_ISSUER?: string }).JWT_ISSUER ?? 'glotutor';

  const { payload } = await jose.jwtVerify(token, publicKey, {
    issuer: iss,
    audience: PAYMENT_LINK_AUDIENCE,
  });

  return { payload: payload as unknown as PaymentLinkTokenPayload };
}
