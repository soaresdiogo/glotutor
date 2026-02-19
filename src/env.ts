import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URI: z.url().default('http://localhost:3000/api'),
  JWT_PRIVATE_KEY: z.string().min(1).optional(),
  JWT_PUBLIC_KEY: z.string().min(1).optional(),
  PRIVATE_KEY: z.string().min(1).optional(),
  PUBLIC_KEY: z.string().min(1).optional(),
  JWT_ISSUER: z.string().default('glotutor'),
  JWT_AUDIENCE: z.string().default('glotutor'),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string().default('7d'),
  RESEND_API_KEY: z.string().optional(),
  // Resend "from": use a verified domain email, or "Display Name <email@domain.com>"
  EMAIL_FROM: z.string().min(1).default('Glotutor <onboarding@resend.dev>'),
  // Reading feature (optional — graceful fallback when unset)
  REDIS_URL: z.url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  /** Max speaking sessions per user per day. Optional, default 5. */
  SPEAKING_DAILY_SESSION_LIMIT: z.coerce.number().int().min(1).optional(),
  /** Max native lessons a student can complete per day. Optional, default 1. */
  MAX_DAILY_LESSONS: z.coerce.number().int().min(1).optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  S3_REGION: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URI: z.url().default('http://localhost:3000/api'),
});

function getServerEnv() {
  const parsed = serverSchema.parse({
    ...process.env,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY ?? process.env.PRIVATE_KEY,
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY ?? process.env.PUBLIC_KEY,
  });
  if (!parsed.JWT_PRIVATE_KEY || !parsed.JWT_PUBLIC_KEY) {
    throw new Error(
      'JWT_PRIVATE_KEY and JWT_PUBLIC_KEY (or PRIVATE_KEY and PUBLIC_KEY) are required on the server.',
    );
  }
  return parsed;
}

function getClientEnv() {
  return clientSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URI: process.env.NEXT_PUBLIC_API_URI,
  });
}

export type Env = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

export const env: Env =
  globalThis.window === undefined
    ? getServerEnv()
    : (getClientEnv() as unknown as Env);
