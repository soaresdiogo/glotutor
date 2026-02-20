import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

import type {
  IPronunciationAssessmentService,
  PronunciationAssessmentResult,
  PronunciationAssessmentWord,
} from '@/features/reading/domain/ports/pronunciation-assessment-service.interface';
import type {
  ITranscriptionService,
  TranscribedWord,
  TranscriptionResult,
} from '@/features/reading/domain/ports/transcription-service.interface';
import { convertToWav } from '@/shared/lib/reading/audio-to-wav';
import {
  getWavDurationSeconds,
  isWav,
  splitWavIntoChunks,
} from '@/shared/lib/reading/wav-chunks';

/** Azure recognizeOnceAsync is limited to ~30s; use 25s chunks to stay under. */
const AZURE_CHUNK_DURATION_SEC = 25;
const AZURE_CHUNK_THRESHOLD_SEC = 20;

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ko: 'ko-KR',
};

function toAzureLocale(languageCode: string): string {
  const base = languageCode.split('-')[0].toLowerCase();
  return LOCALE_MAP[base] ?? `${base}-${base.toUpperCase()}`;
}

function mapErrorType(
  raw: string,
): 'None' | 'Omission' | 'Insertion' | 'Mispronunciation' {
  const v = raw as PronunciationAssessmentWord['errorType'];
  if (
    v === 'None' ||
    v === 'Omission' ||
    v === 'Insertion' ||
    v === 'Mispronunciation'
  ) {
    return v;
  }
  return raw === 'Omission' ? 'Omission' : 'Mispronunciation';
}

function isAlreadyWav(audioBuffer: Buffer, mimeType: string): boolean {
  return (
    mimeType.includes('wav') &&
    audioBuffer.length >= 44 &&
    audioBuffer[0] === 0x52 &&
    audioBuffer[1] === 0x49
  );
}

async function ensureWavBuffer(
  audioBuffer: Buffer,
  mimeType: string,
): Promise<Buffer> {
  if (isAlreadyWav(audioBuffer, mimeType)) return audioBuffer;
  return convertToWav(audioBuffer, mimeType);
}

function shouldUseChunkedPath(wavBuffer: Buffer): boolean {
  return (
    isWav(wavBuffer) &&
    (getWavDurationSeconds(wavBuffer) ?? 0) > AZURE_CHUNK_THRESHOLD_SEC
  );
}

function logReadingDebug(message: string): void {
  if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
    console.info(message);
  }
}

/**
 * Azure Speech pronunciation assessment service.
 * Implements both IPronunciationAssessmentService and ITranscriptionService
 * (transcribe runs assessment without reference and maps to TranscriptionResult).
 *
 * Splits long audio into ~25s chunks (recognizeOnceAsync is limited to ~30s) so
 * the full text is evaluated instead of only the first part.
 */
export class AzureSpeechPronunciationService
  implements IPronunciationAssessmentService, ITranscriptionService
{
  constructor(
    private readonly subscriptionKey: string,
    private readonly region: string,
  ) {}

  /**
   * Single chunk assessment (audio under ~25s). Used by both single and chunked paths.
   */
  private async assessChunk(
    wavBuffer: Buffer,
    referenceText: string,
    languageCode: string,
  ): Promise<PronunciationAssessmentResult> {
    const locale = toAzureLocale(languageCode);
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      this.subscriptionKey,
      this.region,
    );
    speechConfig.speechRecognitionLanguage = locale;
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true,
    );
    const audioConfig = sdk.AudioConfig.fromWavFileInput(wavBuffer);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    try {
      pronunciationConfig.applyTo(recognizer);
      const result = await new Promise<sdk.SpeechRecognitionResult>(
        (resolve, reject) => {
          recognizer.recognizeOnceAsync(resolve, reject);
        },
      );

      if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
        const error =
          result.reason === sdk.ResultReason.Canceled
            ? (sdk.CancellationDetails.fromResult(result)?.errorDetails ??
              'Canceled')
            : 'No speech recognized';
        if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
          console.debug(
            'Azure pronunciation assessment:',
            result.reason,
            error,
          );
        }
        throw new Error(
          `Pronunciation assessment failed: ${error}. Please try again.`,
        );
      }

      const pronResult = sdk.PronunciationAssessmentResult.fromResult(result);
      const detail = pronResult.detailResult;
      const words: PronunciationAssessmentWord[] = (detail.Words ?? []).map(
        (w: {
          Word: string;
          PronunciationAssessment?: {
            AccuracyScore: number;
            ErrorType: string;
          };
          Offset?: number;
          Duration?: number;
        }) => ({
          word: w.Word ?? '',
          accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? 0,
          errorType: mapErrorType(
            w.PronunciationAssessment?.ErrorType ?? 'Mispronunciation',
          ),
          offset: (w as { Offset?: number }).Offset ?? 0,
          duration: (w as { Duration?: number }).Duration ?? 0,
        }),
      );

      const durationTicks = result.duration ?? 0;
      return {
        words,
        pronunciationScore: pronResult.pronunciationScore,
        accuracyScore: pronResult.accuracyScore,
        fluencyScore: pronResult.fluencyScore,
        completenessScore: pronResult.completenessScore,
        durationSeconds: durationTicks / 10000000,
      };
    } finally {
      recognizer.close();
      audioConfig.close();
      speechConfig.close();
    }
  }

  /**
   * Runs assessment by splitting audio into chunks and merging results.
   * Used when audio exceeds Azure's ~25s limit per request.
   */
  private async assessPronunciationChunked(
    wavBuffer: Buffer,
    languageCode: string,
    expectedWords: string[],
  ): Promise<PronunciationAssessmentResult | null> {
    const wavChunks = splitWavIntoChunks(
      wavBuffer,
      AZURE_CHUNK_DURATION_SEC,
      AZURE_CHUNK_THRESHOLD_SEC,
    );
    if (!wavChunks || wavChunks.length <= 1) return null;

    const wordsPerChunk = Math.ceil(expectedWords.length / wavChunks.length);
    const chunkResults: PronunciationAssessmentResult[] = [];
    for (let i = 0; i < wavChunks.length; i++) {
      const start = i * wordsPerChunk;
      const end = Math.min(start + wordsPerChunk, expectedWords.length);
      const refChunk = expectedWords.slice(start, end).join(' ');
      const result = await this.assessChunk(
        wavChunks[i],
        refChunk,
        languageCode,
      );
      chunkResults.push(result);
    }

    const mergedWords: PronunciationAssessmentWord[] = [];
    for (const r of chunkResults) {
      mergedWords.push(...r.words);
    }
    while (mergedWords.length < expectedWords.length) {
      mergedWords.push({
        word: '',
        accuracyScore: 0,
        errorType: 'Omission',
        offset: 0,
        duration: 0,
      });
    }
    const words = mergedWords.slice(0, expectedWords.length);

    let totalDuration = 0;
    let sumAccuracy = 0;
    let sumPronunciation = 0;
    let sumFluency = 0;
    let sumCompleteness = 0;
    for (const r of chunkResults) {
      totalDuration += r.durationSeconds;
      sumAccuracy += r.accuracyScore;
      sumPronunciation += r.pronunciationScore;
      sumFluency += r.fluencyScore;
      sumCompleteness += r.completenessScore;
    }
    const n = chunkResults.length;
    return {
      words,
      pronunciationScore: sumPronunciation / n,
      accuracyScore: sumAccuracy / n,
      fluencyScore: sumFluency / n,
      completenessScore: sumCompleteness / n,
      durationSeconds: totalDuration,
    };
  }

  async assessPronunciation(
    audioBuffer: Buffer,
    mimeType: string,
    referenceText: string,
    languageCode: string,
  ): Promise<PronunciationAssessmentResult> {
    const overallStart = Date.now();
    const wavConversionStart = Date.now();
    const wavBuffer = await ensureWavBuffer(audioBuffer, mimeType);
    const wavConversionDuration = Date.now() - wavConversionStart;
    logReadingDebug(
      `[Reading][Azure] WAV ready in ${wavConversionDuration}ms (mime=${mimeType}, bytes=${audioBuffer.length}, wavBytes=${wavBuffer.length})`,
    );

    const expectedWords = referenceText.trim().split(/\s+/).filter(Boolean);

    if (shouldUseChunkedPath(wavBuffer)) {
      const chunkedResult = await this.assessPronunciationChunked(
        wavBuffer,
        languageCode,
        expectedWords,
      );
      if (chunkedResult) {
        const finalDuration = Date.now() - overallStart;
        logReadingDebug(
          `[Reading][Azure] assessPronunciation chunked, total ${finalDuration}ms (durationSeconds=${chunkedResult.durationSeconds}, words=${chunkedResult.words.length})`,
        );
        return chunkedResult;
      }
    }

    const result = await this.assessChunk(
      wavBuffer,
      referenceText,
      languageCode,
    );
    logReadingDebug(
      `[Reading][Azure] assessPronunciation total ${Date.now() - overallStart}ms (durationSeconds=${result.durationSeconds}, words=${result.words.length})`,
    );
    return result;
  }

  async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    languageCode: string,
  ): Promise<TranscriptionResult> {
    const result = await this.assessPronunciation(
      audioBuffer,
      mimeType,
      '',
      languageCode,
    );
    const words: TranscribedWord[] = result.words.map((w) => ({
      word: w.word,
      start: w.offset / 10000000,
      end: (w.offset + w.duration) / 10000000,
      confidence: w.accuracyScore / 100,
    }));
    return {
      words,
      durationSeconds: result.durationSeconds,
    };
  }
}
