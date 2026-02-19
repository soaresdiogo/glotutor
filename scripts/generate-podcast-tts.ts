/**
 * TTS runner for podcasts created by the content pipeline (or any podcast with transcript but empty audioUrl).
 * Uses the shared generatePodcastTts service.
 *
 * Usage:
 *   npm run generate-podcast-tts -- --podcast-id <uuid>
 *
 * Requires: OPENAI_API_KEY, S3_* or MinIO env, DATABASE_URL.
 */

import * as path from 'node:path';

import dotenv from 'dotenv';

import { generatePodcastTts } from '@/features/listening/infrastructure/services/podcast-tts-generator';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.JWT_PRIVATE_KEY && !process.env.PRIVATE_KEY) {
  process.env.JWT_PRIVATE_KEY = 'cli-unused';
}
if (!process.env.JWT_PUBLIC_KEY && !process.env.PUBLIC_KEY) {
  process.env.JWT_PUBLIC_KEY = 'cli-unused';
}

function parseArgs(): { podcastId: string } {
  const args = process.argv.slice(2);
  const i = args.indexOf('--podcast-id');
  const id = i === -1 ? undefined : args[i + 1];
  if (!id) {
    console.error('Usage: npm run generate-podcast-tts -- --podcast-id <uuid>');
    process.exit(1);
  }
  return { podcastId: id };
}

async function main(): Promise<void> {
  const { podcastId } = parseArgs();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is required. Set it in .env');
    process.exit(1);
  }

  console.log('Generating TTS...');
  const result = await generatePodcastTts(podcastId, apiKey);

  if (result.ok) {
    console.log('Done. Podcast', podcastId, 'audioUrl updated.');
  } else {
    console.error('TTS failed:', result.reason);
    process.exit(1);
  }
}

void (async () => {
  try {
    await main();
  } catch (err: unknown) {
    console.error('Error:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.cause) {
      console.error(
        'Cause:',
        err.cause instanceof Error ? err.cause.message : err.cause,
      );
    }
    if (err instanceof Error && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
