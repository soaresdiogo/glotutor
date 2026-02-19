import OpenAI from 'openai';

import type { IPronunciationService } from '@/features/reading/domain/ports/pronunciation-service.interface';
import { db } from '@/infrastructure/db/client';
import { pronunciationCache } from '@/infrastructure/db/schema/pronunciation-cache';
import { redisGet, redisSet } from '@/shared/lib/reading/redis-client';
import { uploadAudioBuffer } from '@/shared/lib/reading/s3-upload';

const TTL_PRONUNCIATION = 24 * 3600; // 24h

export class PronunciationService implements IPronunciationService {
  async getAudioUrl(word: string, languageCode: string): Promise<string> {
    const key = word.toLowerCase();
    const cacheKey = `reading:pronunciation:${languageCode}:${key}`;
    const cachedUrl = await redisGet(cacheKey);
    if (cachedUrl) return cachedUrl;

    const row = await db.query.pronunciationCache.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.word, key), eq(table.languageCode, languageCode)),
    });
    if (row) {
      await redisSet(cacheKey, row.audioUrl, TTL_PRONUNCIATION);
      return row.audioUrl;
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) return '';

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: word,
      speed: 0.85,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const s3Key = `pronunciation/${languageCode}/${encodeURIComponent(key)}.mp3`;
    const audioUrl = await uploadAudioBuffer(
      s3Key,
      new Uint8Array(buffer),
      'audio/mpeg',
    );

    if (audioUrl) {
      try {
        await db.insert(pronunciationCache).values({
          word: key,
          languageCode,
          audioUrl,
        });
      } catch {
        // Race: another request already inserted
      }
      await redisSet(cacheKey, audioUrl, TTL_PRONUNCIATION);
    }
    return audioUrl ?? '';
  }
}
