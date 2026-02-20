import type { WordScoreEntity } from '@/features/reading/domain/entities/reading-session.entity';
import type { IPronunciationAssessmentService } from '@/features/reading/domain/ports/pronunciation-assessment-service.interface';
import type { IReadingEvaluationService } from '@/features/reading/domain/ports/reading-evaluation-service.interface';
import type { ITranscriptionService } from '@/features/reading/domain/ports/transcription-service.interface';
import type { IDailyProgressRepository } from '@/features/reading/domain/repositories/daily-progress-repository.interface';
import type { IReadingSessionRepository } from '@/features/reading/domain/repositories/reading-session-repository.interface';
import type { ITextRepository } from '@/features/reading/domain/repositories/text-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';
import { evaluateAlignment } from '@/shared/lib/reading/evaluate-alignment';
import { normalizeWord } from '@/shared/lib/reading/normalize-word';
import { calculateOverallScore } from '@/shared/lib/reading/overall-score';
import { alignWordsNW } from '@/shared/lib/reading/sequence-alignment';

import type { EvaluateReadingDto } from '../dto/evaluate-reading.dto';

export type EvaluateReadingResult = {
  sessionId: string;
  wordScores: (WordScoreEntity & {
    expected: string;
    spoken: string;
    index: number;
  })[];
  metrics: {
    wpm: number;
    accuracy: number;
    fluency: number;
    overall: number;
    duration: number;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    missedCount: number;
  };
};

function getExpectedWords(content: string): string[] {
  return content.trim().split(/\s+/).filter(Boolean);
}

function countStatuses(wordScores: Array<{ status: string }>): {
  greenCount: number;
  yellowCount: number;
  redCount: number;
  missedCount: number;
} {
  let greenCount = 0;
  let yellowCount = 0;
  let redCount = 0;
  let missedCount = 0;
  for (const w of wordScores) {
    if (w.status === 'green') greenCount++;
    else if (w.status === 'yellow') yellowCount++;
    else if (w.status === 'red') redCount++;
    else missedCount++;
  }
  return { greenCount, yellowCount, redCount, missedCount };
}

function logReadingDebug(...messages: string[]): void {
  if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
    console.debug(...messages);
  }
}

function azureWordToStatus(
  errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation',
  accuracyScore: number,
): 'green' | 'yellow' | 'red' | 'missed' {
  if (errorType === 'Omission') return 'missed';
  if (errorType === 'None' && accuracyScore >= 80) return 'green';
  if (errorType === 'None' && accuracyScore >= 60) return 'yellow';
  return 'red';
}

export interface IEvaluateReadingUseCase {
  execute(
    userId: string,
    dto: EvaluateReadingDto,
  ): Promise<EvaluateReadingResult>;
}

export class EvaluateReadingUseCase implements IEvaluateReadingUseCase {
  constructor(
    private readonly textRepo: ITextRepository,
    private readonly transcriptionService: ITranscriptionService,
    private readonly sessionRepo: IReadingSessionRepository,
    private readonly dailyProgressRepo: IDailyProgressRepository,
    private readonly pronunciationAssessmentService: IPronunciationAssessmentService | null = null,
    private readonly readingEvaluationService: IReadingEvaluationService | null = null,
  ) {}

  async execute(
    userId: string,
    dto: EvaluateReadingDto,
  ): Promise<EvaluateReadingResult> {
    const text = await this.textRepo.findContentById(dto.textId);
    if (!text) {
      throw new NotFoundError('Text not found.', 'reading.api.textNotFound');
    }

    const expectedWords = getExpectedWords(text.content);
    const audioBuffer = Buffer.from(await dto.audio.arrayBuffer());
    const mimeType = dto.audio.type || 'audio/webm';
    const languageCode = text.languageCode.split('-')[0];

    if (this.pronunciationAssessmentService) {
      return this.executeWithAzure(
        userId,
        dto.textId,
        expectedWords,
        text.content,
        audioBuffer,
        mimeType,
        text.languageCode,
      );
    }

    return this.executeWithTranscription(
      userId,
      dto.textId,
      expectedWords,
      audioBuffer,
      mimeType,
      languageCode,
    );
  }

  private async executeWithAzure(
    userId: string,
    textId: string,
    expectedWords: string[],
    referenceText: string,
    audioBuffer: Buffer,
    mimeType: string,
    languageCode: string,
  ): Promise<EvaluateReadingResult> {
    const assessmentService = this.pronunciationAssessmentService;
    if (!assessmentService) {
      throw new Error('Pronunciation assessment service not configured.');
    }
    const azureResult = await assessmentService.assessPronunciation(
      audioBuffer,
      mimeType,
      referenceText,
      languageCode,
    );

    const wordScores: (WordScoreEntity & {
      expected: string;
      spoken: string;
      index: number;
    })[] = expectedWords.map((expected, index) => {
      const w = azureResult.words[index];
      const status = w
        ? azureWordToStatus(w.errorType, w.accuracyScore)
        : 'missed';
      const score = w ? w.accuracyScore / 100 : 0;
      return {
        status,
        similarity: score,
        confidence: score,
        phoneticMatch: (w?.accuracyScore ?? 0) >= 80,
        combinedScore: score,
        expected: normalizeWord(expected),
        spoken: w?.errorType === 'Omission' ? '' : (w?.word ?? ''),
        index,
      };
    });

    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;
    let missedCount = 0;
    for (const w of wordScores) {
      if (w.status === 'green') greenCount++;
      else if (w.status === 'yellow') yellowCount++;
      else if (w.status === 'red') redCount++;
      else missedCount++;
    }

    const wordsRead = expectedWords.length - missedCount;
    const durationSeconds = Math.max(azureResult.durationSeconds, 1);
    const wpm = Math.round((wordsRead / durationSeconds) * 60);

    const session = await this.sessionRepo.create({
      userId,
      textId,
      wordsPerMinute: wpm,
      accuracy: azureResult.accuracyScore,
      durationSeconds: Math.round(durationSeconds),
      wordsRead,
      greenCount,
      yellowCount,
      redCount,
      missedCount,
      wordScores,
      azurePronunciationScore: azureResult.pronunciationScore,
      azureAccuracyScore: azureResult.accuracyScore,
      azureFluencyScore: azureResult.fluencyScore,
      azureCompletenessScore: azureResult.completenessScore,
    });

    const today = new Date().toISOString().slice(0, 10);
    await this.dailyProgressRepo.addReadingProgress(
      userId,
      today,
      Math.max(1, Math.floor(durationSeconds / 60)),
      wordsRead,
    );

    return {
      sessionId: session.id,
      wordScores,
      metrics: {
        wpm,
        accuracy: azureResult.accuracyScore,
        fluency: azureResult.fluencyScore,
        overall: azureResult.pronunciationScore,
        duration: durationSeconds,
        greenCount,
        yellowCount,
        redCount,
        missedCount,
      },
    };
  }

  private buildWordScoresFromAlignment(
    transcription: Awaited<ReturnType<ITranscriptionService['transcribe']>>,
    expectedWords: string[],
    transcribedWords: string[],
  ): (WordScoreEntity & { expected: string; spoken: string; index: number })[] {
    const alignedPairs = alignWordsNW(expectedWords, transcribedWords);
    const evaluated = evaluateAlignment(alignedPairs, expectedWords);
    const wordScores: (WordScoreEntity & {
      expected: string;
      spoken: string;
      index: number;
    })[] = evaluated.map((e) => {
      const confidence =
        e.transcribedIndex >= 0 && transcription.words[e.transcribedIndex]
          ? (transcription.words[e.transcribedIndex].confidence ?? 0.9)
          : 0;
      return {
        status: e.status,
        similarity: e.similarity,
        confidence,
        phoneticMatch: e.similarity >= 1,
        combinedScore: e.similarity,
        expected: normalizeWord(e.expected),
        spoken: e.spoken,
        index: e.referenceIndex,
      };
    });
    while (wordScores.length < expectedWords.length) {
      const i = wordScores.length;
      wordScores.push({
        status: 'missed',
        similarity: 0,
        confidence: 0,
        phoneticMatch: false,
        combinedScore: 0,
        expected: normalizeWord(expectedWords[i] ?? ''),
        spoken: '',
        index: i,
      });
    }
    return wordScores;
  }

  private async applyAiEvaluationAndRecount(
    wordScores: (WordScoreEntity & {
      expected: string;
      spoken: string;
      index: number;
    })[],
    expectedWords: string[],
    blindTranscript: string,
    languageCode: string,
  ): Promise<{
    greenCount: number;
    yellowCount: number;
    redCount: number;
    missedCount: number;
  }> {
    const service = this.readingEvaluationService;
    if (!service) return countStatuses(wordScores);
    try {
      const aiStatuses = await service.evaluateWordStatuses(
        expectedWords,
        blindTranscript || '(no speech detected)',
        `${languageCode}-${languageCode.toUpperCase()}`,
      );
      for (let i = 0; i < wordScores.length; i++) {
        const aiStatus = aiStatuses[i] ?? wordScores[i].status;
        wordScores[i] = { ...wordScores[i], status: aiStatus };
      }
      return countStatuses(wordScores);
    } catch {
      return countStatuses(wordScores);
    }
  }

  private async executeWithTranscription(
    userId: string,
    textId: string,
    expectedWords: string[],
    audioBuffer: Buffer,
    mimeType: string,
    languageCode: string,
  ): Promise<EvaluateReadingResult> {
    const transcription = await this.transcriptionService.transcribe(
      audioBuffer,
      mimeType,
      languageCode,
    );

    const transcribedWords = transcription.words.map((w) => w.word);
    const blindTranscript = transcribedWords.join(' ').trim();
    logReadingDebug(
      '=== PRONUNCIATION ASSESSMENT DEBUG ===',
      `Transcription: ${blindTranscript || '(empty or silent)'}`,
    );

    const durationSecondsFromApi = Math.max(
      transcription.durationSeconds,
      transcription.words.length === 0 ? 1 : 0,
    );

    const wordScores = this.buildWordScoresFromAlignment(
      transcription,
      expectedWords,
      transcribedWords,
    );
    let counts = countStatuses(wordScores);

    if (this.readingEvaluationService && wordScores.length > 0) {
      counts = await this.applyAiEvaluationAndRecount(
        wordScores,
        expectedWords,
        blindTranscript,
        languageCode,
      );
    }

    const { greenCount, yellowCount, redCount, missedCount } = counts;
    const wordsRead = expectedWords.length - missedCount;
    const durationSeconds =
      durationSecondsFromApi > 0
        ? durationSecondsFromApi
        : Math.max(1, wordScores.length * 0.3);
    const wpm = Math.round((wordsRead / durationSeconds) * 60);

    const overallScore = calculateOverallScore(
      wordScores.map((w) => ({
        status: w.status,
        expected: w.expected,
        actual: w.spoken ?? '',
        similarity: w.similarity,
      })),
    );
    const accuracy = overallScore.accuracy;

    const session = await this.sessionRepo.create({
      userId,
      textId,
      wordsPerMinute: wpm,
      accuracy,
      durationSeconds: Math.round(durationSeconds),
      wordsRead,
      greenCount,
      yellowCount,
      redCount,
      missedCount,
      wordScores,
    });

    const today = new Date().toISOString().slice(0, 10);
    await this.dailyProgressRepo.addReadingProgress(
      userId,
      today,
      Math.max(1, Math.floor(durationSeconds / 60)),
      wordsRead,
    );

    return {
      sessionId: session.id,
      wordScores,
      metrics: {
        wpm,
        accuracy,
        fluency: overallScore.fluency,
        overall: overallScore.overall,
        duration: durationSeconds,
        greenCount,
        yellowCount,
        redCount,
        missedCount,
      },
    };
  }
}
