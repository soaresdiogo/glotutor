/**
 * CLI for the content generation pipeline (lesson, reading, podcast, speaking).
 * Prompts are loaded from /prompts (base/, passes/, references/).
 *
 * Usage:
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR   (L1 support in content for Portuguese speakers)
 *   npm run generate-content -- --batch p1 --target en-US
 *   npm run generate-content -- --batch p1 --target en-US --native pt-BR
 *   npm run generate-content -- --batch p1 --target en-US --native pt-BR --force   (regenerate even if already generated)
 *   npm run generate-content -- --batch p1 --target en-US --native pt-BR --concurrency 3   (run up to 3 modules in parallel)
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --passes lesson,reading
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --review  (no DB write)
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --instructions "Focus on American coffee shop culture."
 *
 * Batch mode: by default, modules that already have all four passes (lesson, reading, podcast, speaking)
 * for the given target language are skipped. Use --force to regenerate everything.
 *
 * Token usage (approximate per module, one language):
 *   - Lesson: 2 API calls (sub-pass A + B), ~20–40k input + ~15–25k output each
 *   - Reading: 1 call, ~20–35k input + ~4–8k output
 *   - Podcast: 1 call, ~18–30k input + ~4–8k output
 *   - Speaking: 1 call, ~20–32k input + ~3–6k output
 *   Total per module: ~5 requests, ~100–150k input tokens, ~45–75k output tokens (~150–225k total).
 *   To see actual usage per run: LOG_TOKEN_USAGE=1 npm run generate-content -- ...
 *   To increase throughput: request higher TPM/RPM in OpenAI dashboard (Settings → Limits); use --concurrency 2–5 if your tier allows.
 *
 * Provider and model (set in .env only; no code change):
 *   CONTENT_GENERATION_PROVIDER=openai   # or "gemini"
 *   CONTENT_GENERATION_MODEL=gpt-4o-mini # or gemini-1.5-pro, gpt-4o, etc.
 *   OPENAI_API_KEY=sk-...                # when provider=openai
 *   GEMINI_API_KEY=...                   # when provider=gemini
 */

import * as path from 'node:path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.JWT_PRIVATE_KEY && !process.env.PRIVATE_KEY) {
  process.env.JWT_PRIVATE_KEY = 'cli-unused';
}
if (!process.env.JWT_PUBLIC_KEY && !process.env.PUBLIC_KEY) {
  process.env.JWT_PUBLIC_KEY = 'cli-unused';
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const PASSES = ['lesson', 'reading', 'podcast', 'speaking'] as const;
type Pass = (typeof PASSES)[number];

function parseArgs(): {
  module: string;
  level: string;
  target: string;
  native: string;
  passes: Pass[];
  review: boolean;
  batch: string | null;
  instructions: string | null;
  force: boolean;
  concurrency: number;
} {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args[i + 1];
  };
  const moduleId = get('--module') ?? get('-m');
  const level = get('--level') ?? get('-L');
  const target = get('--target') ?? get('-t') ?? get('--lang');
  const native = get('--native') ?? get('-n');
  const passesStr = get('--passes') ?? get('-p');
  const review = args.includes('--review') || args.includes('-r');
  const batch = get('--batch') ?? null;
  const instructions = get('--instructions') ?? null;
  const force = args.includes('--force') || args.includes('-f');
  const concurrencyRaw = get('--concurrency') ?? get('-c');
  const concurrency = Math.max(
    1,
    Math.min(10, Number.parseInt(concurrencyRaw ?? '1', 10) || 1),
  );

  const passes: Pass[] = passesStr
    ? (passesStr.split(',').map((s) => s.trim()) as Pass[]).filter((p) =>
        PASSES.includes(p),
      )
    : [...PASSES];

  const targetResolved = target ?? 'en-US';
  return {
    module: moduleId ?? '',
    level: level ?? '',
    target: targetResolved,
    native: native ?? targetResolved,
    passes: passes.length ? passes : [...PASSES],
    review,
    batch,
    instructions,
    force,
    concurrency,
  };
}

async function runSingle(
  moduleId: string,
  level: string,
  target: string,
  native: string,
  passes: Pass[],
  review: boolean,
  instructions: string | null,
): Promise<void> {
  // Provider and API key come from .env (CONTENT_GENERATION_PROVIDER, OPENAI_API_KEY or GEMINI_API_KEY).
  // The factory will throw with a clear message if the chosen provider's key is missing.

  const levelUpper = level.toUpperCase();
  if (!CEFR_LEVELS.includes(levelUpper as (typeof CEFR_LEVELS)[number])) {
    console.error(
      `Invalid level: ${level}. Must be one of: ${CEFR_LEVELS.join(', ')}`,
    );
    process.exit(1);
  }

  const { makeGenerateModuleContentUseCase } = await import(
    '@/features/content-generation/application/factories/generate-module-content.factory'
  );
  const useCase = makeGenerateModuleContentUseCase();

  if (review) {
    console.log(
      'Review mode: output will be printed but NOT saved to the database. Omit --review to save.\n',
    );
  }

  const results = await useCase.execute(
    {
      moduleId,
      cefrLevel: levelUpper as (typeof CEFR_LEVELS)[number],
      targetLanguage: target,
      nativeLanguage: native,
      passesToRun: passes,
      reviewMode: review,
      specificInstructions: instructions ?? undefined,
    },
    {
      onProgress: (msg) => console.log(msg),
      saveToDb: !review,
    },
  );

  for (const r of results) {
    console.log(`\n--- ${r.pass} ---`);
    console.log('Validation:', r.validation.passed ? 'OK' : 'FAILED');
    if (r.validation.errors.length) {
      console.log('Errors:', r.validation.errors);
    }
    if (r.validation.warnings.length) {
      console.log('Warnings:', r.validation.warnings);
    }
    if (review) {
      console.log(JSON.stringify(r.raw, null, 2));
    }
    if (r.saved) {
      console.log(`Saved ${r.pass} to database.`);
    }
  }
  console.log('Finished generating content for module:', moduleId);
}

async function runBatch(
  batch: string,
  target: string,
  native: string,
  force: boolean,
  concurrency: number,
): Promise<void> {
  const { loadModuleList } = await import(
    '@/features/content-generation/infrastructure/utils/module-list-parser'
  );
  const { getExistingPasses } = await import(
    '@/features/content-generation/infrastructure/services/module-content-existence.service'
  );
  const { db } = await import('@/infrastructure/db/client');

  const list = await loadModuleList();
  // P1 = same set as audit default: A1 1-5, A2 1-5, B1 1-5, B2 1-3 (from 06-MODULE-LIST.md phase column)
  const batchModules =
    batch.toLowerCase() === 'p1'
      ? list.filter((m) => (m.phase ?? '').toUpperCase() === 'P1')
      : list.filter(
          (m) =>
            m.phase === batch.toUpperCase() || m.moduleId.startsWith(batch),
        );

  if (batchModules.length === 0) {
    console.error(`No modules found for batch: ${batch}`);
    process.exit(1);
  }

  console.log(
    `Batch ${batch}: ${batchModules.length} modules (--force: ${force ? 'yes' : 'no, will skip already generated'}, concurrency: ${concurrency})\n`,
  );

  const toRun: typeof batchModules = [];
  for (const m of batchModules) {
    if (!force) {
      const existing = await getExistingPasses(db, m.moduleId, m.level, target);
      const allDone =
        existing.lesson &&
        existing.reading &&
        existing.podcast &&
        existing.speaking;
      if (allDone) {
        console.log(
          `>>> ${m.moduleId} (${m.level}) — skipped (already generated)`,
        );
        continue;
      }
    }
    toRun.push(m);
  }

  for (let i = 0; i < toRun.length; i += concurrency) {
    const chunk = toRun.slice(i, i + concurrency);
    await Promise.all(
      chunk.map((m) => {
        console.log(`\n>>> ${m.moduleId} (${m.level})`);
        return runSingle(
          m.moduleId,
          m.level,
          target,
          native,
          ['lesson', 'reading', 'podcast', 'speaking'],
          false,
          null,
        );
      }),
    );
  }
}

async function main(): Promise<void> {
  const {
    module: moduleId,
    level,
    target,
    native,
    passes,
    review,
    batch,
    instructions,
    force,
    concurrency,
  } = parseArgs();

  if (batch) {
    await runBatch(batch, target, native, force, concurrency);
    return;
  }

  if (!moduleId || !level) {
    console.error(
      'Usage: npm run generate-content -- --module <id> --level <CEFR> [--target en-US] [--native pt-BR] [--passes lesson,reading] [--review] [--instructions "..."]',
    );
    console.error(
      '       npm run generate-content -- --batch <p1|P2|...> [--target en-US] [--native pt-BR] [--force] [--concurrency N]',
    );
    console.error(
      'Example: npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR',
    );
    console.error(
      'Example (parallel batch): npm run generate-content -- --batch p1 --target en-US --native pt-BR --concurrency 3',
    );
    process.exit(1);
  }

  await runSingle(
    moduleId,
    level,
    target,
    native,
    passes,
    review,
    instructions,
  );
}

// tsx compiles to CJS; top-level await is not supported there — use IIFE
void (async () => {
  // NOSONAR
  try {
    await main();
    process.exit(0);
  } catch (err: unknown) {
    console.error('Error:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
})();
