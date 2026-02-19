import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { PodcastEntity } from '@/features/listening/domain/entities/podcast.entity';
import type { IAIGateway } from '@/features/listening/domain/ports/ai-gateway.interface';
import type { IStorageGateway } from '@/features/listening/domain/ports/storage-gateway.interface';
import type { ITTSGateway } from '@/features/listening/domain/ports/tts-gateway.interface';
import type { IPodcastRepository } from '@/features/listening/domain/repositories/podcast-repository.interface';
import { BadRequestError } from '@/shared/lib/errors';
import { ffmpegPath } from '@/shared/lib/ffmpeg-path';

const DURATION_TARGET: Record<string, string> = {
  A1: '80-120',
  A2: '120-180',
  B1: '180-250',
  B2: '250-350',
  C1: '350-450',
  C2: '450-600',
};

/** TTS speed by CEFR: A1 slower for clarity, then normal. */
const TTS_SPEED_BY_CEFR: Record<string, number> = {
  A1: 0.85,
  A2: 0.9,
  B1: 0.95,
  B2: 1,
  C1: 1,
  C2: 1,
};

const VOICE_A = 'nova' as const;
const VOICE_B = 'echo' as const;
const SILENCE_LONG_S = 0.8;
const SILENCE_SHORT_S = 0.3;
const SAMPLE_RATE = 24000;

export type GeneratePodcastInput = {
  targetLanguage: string;
  nativeLanguage: string;
  cefrLevel: string;
  topic: string;
  /** Optional progress callback for CLI/logging (e.g. "Generating TTS for segment 1/8...") */
  onProgress?: (message: string) => void;
};

export interface IGeneratePodcastUseCase {
  execute(input: GeneratePodcastInput): Promise<PodcastEntity>;
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: Buffer[] = [];
    proc.stderr?.on('data', (chunk: Buffer) => stderr.push(chunk));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `ffmpeg exited ${code}: ${Buffer.concat(stderr).toString('utf8').slice(-500)}`,
          ),
        );
    });
    proc.on('error', (err) => reject(err));
  });
}

export class GeneratePodcastUseCase implements IGeneratePodcastUseCase {
  constructor(
    private readonly podcastRepo: IPodcastRepository,
    private readonly aiGateway: IAIGateway,
    private readonly ttsGateway: ITTSGateway,
    private readonly storageGateway: IStorageGateway,
  ) {}

  async execute(input: GeneratePodcastInput): Promise<PodcastEntity> {
    const languageId = await this.podcastRepo.findLanguageIdByCode(
      input.targetLanguage,
    );
    if (!languageId) {
      throw new BadRequestError(
        `Unsupported language: ${input.targetLanguage}`,
        'listening.api.unsupportedLanguage',
      );
    }
    const durationTarget =
      DURATION_TARGET[input.cefrLevel.toUpperCase()] ?? '120-180';
    const speed = TTS_SPEED_BY_CEFR[input.cefrLevel.toUpperCase()] ?? 1;

    input.onProgress?.('Generating script...');
    const scriptResult = await this.aiGateway.generatePodcastScript({
      targetLanguage: input.targetLanguage,
      nativeLanguage: input.nativeLanguage,
      cefrLevel: input.cefrLevel,
      topic: input.topic,
      durationTarget,
    });

    const segments = scriptResult.speakerSegments?.length
      ? scriptResult.speakerSegments
      : null;

    let audioBuffer: Uint8Array;

    if (segments && segments.length > 0) {
      audioBuffer = await this.generateMultiVoiceAudio(
        segments,
        speed,
        input.onProgress,
      );
    } else {
      input.onProgress?.('Generating TTS...');
      const textToSpeak = scriptResult.script;
      audioBuffer = await this.ttsGateway.synthesize({
        text: textToSpeak,
        voice: VOICE_A,
        speed,
        model: 'tts-1-hd',
      });
    }

    input.onProgress?.('Uploading to storage...');
    const langPrefix = input.targetLanguage.split('-')[0];
    const level = input.cefrLevel.toUpperCase();
    const key = `podcasts/${langPrefix}/${level}/${crypto.randomUUID()}.mp3`;
    const audioUrl = await this.storageGateway.uploadAudio(
      key,
      audioBuffer,
      'audio/mpeg',
    );
    if (!audioUrl) {
      throw new Error('Failed to upload podcast audio');
    }

    const wordCount = scriptResult.script.split(/\s+/).length;
    const durationSeconds = Math.ceil((wordCount / 150) * 60);

    const podcast = await this.podcastRepo.create({
      languageId,
      title: scriptResult.title,
      description: scriptResult.description,
      cefrLevel: input.cefrLevel,
      audioUrl,
      transcript: scriptResult.transcript,
      durationSeconds,
      vocabularyHighlights: scriptResult.vocabularyHighlights,
    });

    input.onProgress?.('Generating exercises...');
    const exercisesResult = await this.aiGateway.generateExercises({
      transcript: scriptResult.transcript,
      targetLanguage: input.targetLanguage,
      nativeLanguage: input.nativeLanguage,
      cefrLevel: input.cefrLevel,
    });

    if (exercisesResult.exercises.length > 0) {
      await this.podcastRepo.createExercises(
        podcast.id,
        exercisesResult.exercises.map((e) => ({
          questionNumber: e.questionNumber,
          type: e.type,
          questionText: e.questionText,
          options: e.options,
          correctAnswer: e.correctAnswer,
          explanationText: e.explanationText,
        })),
      );
    }

    return podcast;
  }

  private async generateMultiVoiceAudio(
    segments: Array<{ speaker: 'A' | 'B'; text: string }>,
    speed: number,
    onProgress?: (message: string) => void,
  ): Promise<Uint8Array> {
    const tmpDir = path.join(
      os.tmpdir(),
      `podcast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    );
    fs.mkdirSync(tmpDir, { recursive: true });
    const toDelete: string[] = [tmpDir];

    try {
      const segmentFiles: string[] = [];
      for (let i = 0; i < segments.length; i++) {
        onProgress?.(
          `Generating TTS for segment ${i + 1}/${segments.length}...`,
        );
        const seg = segments[i];
        const voice = seg.speaker === 'A' ? VOICE_A : VOICE_B;
        const buf = await this.ttsGateway.synthesize({
          text: seg.text.trim(),
          voice,
          speed,
          model: 'tts-1-hd',
        });
        const segPath = path.join(tmpDir, `seg${i}.mp3`);
        fs.writeFileSync(segPath, buf);
        segmentFiles.push(segPath);
      }

      const silenceLongPath = path.join(tmpDir, 'silence_08.mp3');
      const silenceShortPath = path.join(tmpDir, 'silence_03.mp3');
      await runFfmpeg([
        '-y',
        '-f',
        'lavfi',
        '-i',
        `anullsrc=r=${SAMPLE_RATE}:cl=mono`,
        '-t',
        String(SILENCE_LONG_S),
        '-c:a',
        'libmp3lame',
        '-q:a',
        '2',
        silenceLongPath,
      ]);
      await runFfmpeg([
        '-y',
        '-f',
        'lavfi',
        '-i',
        `anullsrc=r=${SAMPLE_RATE}:cl=mono`,
        '-t',
        String(SILENCE_SHORT_S),
        '-c:a',
        'libmp3lame',
        '-q:a',
        '2',
        silenceShortPath,
      ]);

      const listPath = path.join(tmpDir, 'concat.txt');
      const escapePath = (p: string) => p.replaceAll("'", String.raw`'\''`);
      const listLines: string[] = [];
      for (let i = 0; i < segmentFiles.length; i++) {
        listLines.push(`file '${escapePath(segmentFiles[i])}'`);
        if (i < segmentFiles.length - 1) {
          const nextSpeaker = segments[i + 1].speaker;
          const sameSpeaker = nextSpeaker === segments[i].speaker;
          listLines.push(
            `file '${escapePath(sameSpeaker ? silenceShortPath : silenceLongPath)}'`,
          );
        }
      }
      fs.writeFileSync(listPath, listLines.join('\n'), 'utf8');

      onProgress?.('Concatenating audio with ffmpeg...');
      const outputPath = path.join(tmpDir, 'output.mp3');
      await runFfmpeg([
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        listPath,
        '-c:a',
        'libmp3lame',
        '-q:a',
        '2',
        outputPath,
      ]);

      const outBuffer = fs.readFileSync(outputPath);
      return new Uint8Array(outBuffer);
    } catch (err) {
      console.error('[GeneratePodcast] ffmpeg/tts error:', err);
      throw err;
    } finally {
      try {
        for (const p of toDelete) {
          if (fs.existsSync(p)) {
            fs.rmSync(p, { recursive: true, force: true });
          }
        }
      } catch (error_) {
        console.warn('[GeneratePodcast] cleanup warning:', error_);
      }
    }
  }
}
