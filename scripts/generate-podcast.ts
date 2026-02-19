/**
 * CLI script to generate a podcast with exercises and save to DB + MinIO.
 *
 * Usage:
 *   npx tsx scripts/generate-podcast.ts --lang en --native pt --level A1 --topic "Ordering food at a café"
 *
 * Options:
 *   --dry-run  Generate script and exercises JSON only (no TTS, upload, or DB). Useful for testing prompts.
 */

import * as path from 'node:path';

import dotenv from 'dotenv';

// Load .env.local before any imports that read process.env (e.g. @/env)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// CLI does not use JWT; avoid getServerEnv() throwing when keys are missing (e.g. .env.local has no JWT)
if (!process.env.JWT_PRIVATE_KEY && !process.env.PRIVATE_KEY) {
  process.env.JWT_PRIVATE_KEY = 'cli-unused';
}
if (!process.env.JWT_PUBLIC_KEY && !process.env.PUBLIC_KEY) {
  process.env.JWT_PUBLIC_KEY = 'cli-unused';
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const DURATION_TARGET: Record<string, string> = {
  A1: '80-120',
  A2: '120-180',
  B1: '180-250',
  B2: '250-350',
  C1: '350-450',
  C2: '450-600',
};

function parseArgs(): {
  lang: string;
  native: string;
  level: string;
  topic: string;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args[i + 1];
  };
  const lang = get('--lang') ?? get('-l');
  const native = get('--native') ?? get('-n');
  const level = get('--level') ?? get('-L');
  const topic = get('--topic') ?? get('-t');
  const dryRun = args.includes('--dry-run');

  if (!lang || !native || !level || !topic) {
    console.error(
      'Usage: npx tsx scripts/generate-podcast.ts --lang <code> --native <code> --level <CEFR> --topic "<topic>" [--dry-run]',
    );
    console.error(
      'Example: --lang en --native pt --level A1 --topic "Ordering food at a café"',
    );
    process.exit(1);
  }

  const levelUpper = level.toUpperCase();
  if (!CEFR_LEVELS.includes(levelUpper as (typeof CEFR_LEVELS)[number])) {
    console.error(
      `Invalid level: ${level}. Must be one of: ${CEFR_LEVELS.join(', ')}`,
    );
    process.exit(1);
  }

  return { lang, native, level: levelUpper, topic, dryRun };
}

async function runDryRun(
  lang: string,
  native: string,
  level: string,
  topic: string,
): Promise<void> {
  const { OpenAIAIGateway } = await import(
    '@/features/listening/infrastructure/gateways/openai-ai.gateway'
  );
  const { env } = await import('@/env');

  const apiKey = env.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      'OPENAI_API_KEY is required for dry-run. Set it in .env.local.',
    );
    process.exit(1);
  }

  const ai = new OpenAIAIGateway(apiKey);
  const durationTarget = DURATION_TARGET[level] ?? '120-180';

  console.log('Generating script...');
  const scriptResult = await ai.generatePodcastScript({
    targetLanguage: lang,
    nativeLanguage: native,
    cefrLevel: level,
    topic,
    durationTarget,
  });

  console.log('Generating exercises...');
  const exercisesResult = await ai.generateExercises({
    transcript: scriptResult.transcript,
    targetLanguage: lang,
    nativeLanguage: native,
    cefrLevel: level,
  });

  console.log('\n--- Script & exercises (dry-run) ---\n');
  console.log(
    JSON.stringify(
      { script: scriptResult, exercises: exercisesResult.exercises },
      null,
      2,
    ),
  );
}

async function runFull(
  lang: string,
  native: string,
  level: string,
  topic: string,
): Promise<void> {
  const { makeGeneratePodcastUseCase } = await import(
    '@/features/listening/application/factories/generate-podcast.factory'
  );

  const useCase = makeGeneratePodcastUseCase();
  const podcast = await useCase.execute({
    targetLanguage: lang,
    nativeLanguage: native,
    cefrLevel: level,
    topic,
    onProgress: (msg) => console.log(msg),
  });

  console.log(`Done! Podcast ID: ${podcast.id}`);
}

async function main(): Promise<void> {
  const { lang, native, level, topic, dryRun } = parseArgs();
  if (dryRun) {
    await runDryRun(lang, native, level, topic);
  } else {
    await runFull(lang, native, level, topic);
  }
}

main().catch((err: unknown) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  const errObj = err instanceof Error ? err : null;
  if (errObj?.cause instanceof Error) {
    console.error('Cause:', errObj.cause.message);
  }
  if (errObj?.stack) {
    console.error(errObj.stack);
  }
  const msg = errObj?.message ?? String(err);
  if (
    typeof msg === 'string' &&
    (msg.includes('Failed query') || msg.includes('supported_languages'))
  ) {
    console.error(
      '\nTip: Ensure DATABASE_URL in .env.local is correct and migrations are applied: npm run db:migrate',
    );
  }
  process.exit(1);
});
