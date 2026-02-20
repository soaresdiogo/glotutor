import { eq } from 'drizzle-orm';
import type { TTSVoice } from '@/features/listening/domain/ports/tts-gateway.interface';
import { OpenAITTSGateway } from '@/features/listening/infrastructure/gateways/openai-tts.gateway';
import { S3StorageGateway } from '@/features/listening/infrastructure/gateways/s3-storage.gateway';
import { db } from '@/infrastructure/db/client';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';

const TTS_SPEED_BY_CEFR: Record<string, number> = {
  A1: 0.85,
  A2: 0.9,
  B1: 0.95,
  B2: 1,
  C1: 1,
  C2: 1,
};

const VOICE_1 = 'nova' as const;
const VOICE_2 = 'alloy' as const;

function getVoiceForSpeaker(speakerId: string | undefined): TTSVoice {
  if (!speakerId) return VOICE_1;
  const id = speakerId.toLowerCase();
  if (
    id.includes('2') ||
    id === 'speaker_2' ||
    id === 'guest' ||
    id === 'friend_2'
  )
    return VOICE_2;
  return VOICE_1;
}

type PodcastRow = {
  id: string;
  transcript: string;
  audioUrl: string;
  cefrLevel: string;
  languageId: string;
  richContent: unknown;
};

async function fetchPodcastRow(
  podcastId: string,
): Promise<{ ok: true; row: PodcastRow } | { ok: false; reason: string }> {
  try {
    const [row] = await db
      .select({
        id: podcasts.id,
        transcript: podcasts.transcript,
        audioUrl: podcasts.audioUrl,
        cefrLevel: podcasts.cefrLevel,
        languageId: podcasts.languageId,
        richContent: podcasts.richContent,
      })
      .from(podcasts)
      .where(eq(podcasts.id, podcastId))
      .limit(1);
    if (!row) return { ok: false, reason: 'Podcast not found' };
    return { ok: true, row: row as PodcastRow };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : '';
    return { ok: false, reason: cause ? `${msg} (${cause})` : msg };
  }
}

function validateRowForTts(
  row: PodcastRow,
): { ok: true } | { ok: false; reason: string } {
  if (row.audioUrl?.length) {
    return { ok: false, reason: 'Podcast already has audio' };
  }
  if (!row.transcript?.trim()) {
    return { ok: false, reason: 'Podcast has no transcript' };
  }
  return { ok: true };
}

function getScriptLines(
  row: PodcastRow,
): Array<{ speaker?: string; text?: string }> {
  const rich = row.richContent as {
    script?: {
      sections?: Array<{ lines?: Array<{ speaker?: string; text?: string }> }>;
    };
  } | null;
  const sections = rich?.script?.sections ?? [];
  return sections
    .flatMap((s) => s.lines ?? [])
    .filter((l) => (l.text ?? '').trim());
}

async function synthesizeMultiSpeaker(
  tts: OpenAITTSGateway,
  lines: Array<{ speaker?: string; text?: string }>,
  speed: number,
): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for (const line of lines) {
    const text = (line.text ?? '').trim();
    if (!text) continue;
    const buf = await tts.synthesize({
      text,
      voice: getVoiceForSpeaker(line.speaker),
      speed,
      model: 'tts-1-hd',
    });
    chunks.push(buf);
  }
  const audioBuffer = new Uint8Array(
    chunks.reduce((acc, b) => acc + b.length, 0),
  );
  let offset = 0;
  for (const c of chunks) {
    audioBuffer.set(c, offset);
    offset += c.length;
  }
  return audioBuffer;
}

async function synthesizeSingleVoice(
  tts: OpenAITTSGateway,
  transcript: string,
  speed: number,
): Promise<Uint8Array> {
  const text = transcript
    .replaceAll(/\b(speaker_\d+|host|guest):\s*/gi, '')
    .trim();
  return tts.synthesize({
    text: text || transcript,
    voice: VOICE_1,
    speed,
    model: 'tts-1-hd',
  });
}

/**
 * Generates audio for a podcast via OpenAI TTS, uploads to S3/MinIO, and updates the podcast row.
 * Uses two voices when script has multiple speakers (from rich_content). Idempotent: skips if podcast already has audioUrl.
 */
export async function generatePodcastTts(
  podcastId: string,
  apiKey: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const fetchResult = await fetchPodcastRow(podcastId);
  if (!fetchResult.ok) return fetchResult;

  const validation = validateRowForTts(fetchResult.row);
  if (!validation.ok) return validation;

  const row = fetchResult.row;
  const [langRow] = await db
    .select({ code: supportedLanguages.code })
    .from(supportedLanguages)
    .where(eq(supportedLanguages.id, row.languageId))
    .limit(1);
  const langPrefix = (langRow?.code ?? 'en').split('-')[0];
  const level = (row.cefrLevel ?? 'A1').toUpperCase();
  const speed = TTS_SPEED_BY_CEFR[level] ?? 1;

  const tts = new OpenAITTSGateway(apiKey);
  const allLines = getScriptLines(row);
  const audioBuffer =
    allLines.length >= 2
      ? await synthesizeMultiSpeaker(tts, allLines, speed)
      : await synthesizeSingleVoice(tts, row.transcript, speed);

  const key = `podcasts/${langPrefix}/${level}/${crypto.randomUUID()}.mp3`;
  const storage = new S3StorageGateway();
  const audioUrl = await storage.uploadAudio(key, audioBuffer, 'audio/mpeg');
  if (!audioUrl) return { ok: false, reason: 'Failed to upload audio' };

  const durationSeconds = Math.ceil(
    (row.transcript.split(/\s+/).filter(Boolean).length / 150) * 60,
  );
  await db
    .update(podcasts)
    .set({
      audioUrl,
      durationSeconds,
      updatedAt: new Date(),
    })
    .where(eq(podcasts.id, podcastId));

  return { ok: true };
}
