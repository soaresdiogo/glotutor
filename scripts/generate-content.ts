/**
 * CLI for the content generation pipeline (lesson, reading, podcast, speaking).
 * Prompts are loaded from /prompts (base/, passes/, references/).
 *
 * Usage:
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --passes lesson,reading
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --review  (no DB write)
 *   npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --instructions "Focus on American coffee shop culture."
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

  const passes: Pass[] = passesStr
    ? (passesStr.split(',').map((s) => s.trim()) as Pass[]).filter((p) =>
        PASSES.includes(p),
      )
    : [...PASSES];

  return {
    module: moduleId ?? '',
    level: level ?? '',
    target: target ?? 'en-US',
    native: native ?? 'pt-BR',
    passes: passes.length ? passes : [...PASSES],
    review,
    batch,
    instructions,
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is required. Set it in .env');
    process.exit(1);
  }

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
  const useCase = makeGenerateModuleContentUseCase(apiKey);

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
): Promise<void> {
  const { loadModuleList } = await import(
    '@/features/content-generation/infrastructure/utils/module-list-parser'
  );
  const list = await loadModuleList();
  const p1Modules = list.filter((m) => m.phase === 'P1');
  const batchModules =
    batch.toLowerCase() === 'p1'
      ? p1Modules
      : list.filter(
          (m) =>
            m.phase === batch.toUpperCase() || m.moduleId.startsWith(batch),
        );

  if (batchModules.length === 0) {
    console.error(`No modules found for batch: ${batch}`);
    process.exit(1);
  }

  console.log(`Batch ${batch}: ${batchModules.length} modules`);
  for (const m of batchModules) {
    console.log(`\n>>> ${m.moduleId} (${m.level})`);
    await runSingle(
      m.moduleId,
      m.level,
      target,
      native,
      ['lesson', 'reading', 'podcast', 'speaking'],
      false,
      null,
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
  } = parseArgs();

  if (batch) {
    await runBatch(batch, target, native);
    return;
  }

  if (!moduleId || !level) {
    console.error(
      'Usage: npm run generate-content -- --module <id> --level <CEFR> [--target en-US] [--native pt-BR] [--passes lesson,reading] [--review] [--instructions "..."]',
    );
    console.error(
      'Example: npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR',
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
  } catch (err: unknown) {
    console.error('Error:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
})();
