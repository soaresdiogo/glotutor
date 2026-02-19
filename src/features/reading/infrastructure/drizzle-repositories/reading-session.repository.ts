import { and, desc, eq } from 'drizzle-orm';

import type {
  CreateReadingSessionInput,
  GrammarItemEntity,
  ReadingSessionEntity,
  ReadingSessionFeedbackEntity,
} from '@/features/reading/domain/entities/reading-session.entity';
import type {
  ComprehensionAnswerEntry,
  IReadingSessionRepository,
  LastSessionResult,
} from '@/features/reading/domain/repositories/reading-session-repository.interface';

import { readingSessions } from '@/infrastructure/db/schema/reading-sessions';
import type { DbClient } from '@/infrastructure/db/types';

export class ReadingSessionRepository implements IReadingSessionRepository {
  constructor(private readonly dbClient: DbClient) {}

  async create(data: CreateReadingSessionInput): Promise<ReadingSessionEntity> {
    const [row] = await this.dbClient
      .insert(readingSessions)
      .values({
        userId: data.userId,
        textId: data.textId,
        wordsPerMinute: data.wordsPerMinute,
        accuracy: data.accuracy,
        durationSeconds: data.durationSeconds,
        wordsRead: data.wordsRead,
        greenCount: data.greenCount,
        yellowCount: data.yellowCount,
        redCount: data.redCount,
        missedCount: data.missedCount,
        wordScores: data.wordScores as unknown as Record<string, unknown>[],
        azurePronunciationScore: data.azurePronunciationScore ?? null,
        azureAccuracyScore: data.azureAccuracyScore ?? null,
        azureFluencyScore: data.azureFluencyScore ?? null,
        azureCompletenessScore: data.azureCompletenessScore ?? null,
        status: 'completed',
        completedAt: new Date(),
      })
      .returning();
    if (!row) throw new Error('Failed to create reading session');
    return this.toEntity(row);
  }

  async findCompletedTextIdsByUser(userId: string): Promise<string[]> {
    const rows = await this.dbClient
      .selectDistinct({ textId: readingSessions.textId })
      .from(readingSessions)
      .where(
        and(
          eq(readingSessions.userId, userId),
          eq(readingSessions.status, 'completed'),
        ),
      );
    return rows.map((r) => r.textId);
  }

  async findLatestCompletedByUserAndText(
    userId: string,
    textId: string,
  ): Promise<LastSessionResult | null> {
    const row = await this.dbClient.query.readingSessions.findFirst({
      where: and(
        eq(readingSessions.userId, userId),
        eq(readingSessions.textId, textId),
        eq(readingSessions.status, 'completed'),
      ),
      orderBy: [desc(readingSessions.completedAt)],
      columns: {
        id: true,
        wordsPerMinute: true,
        accuracy: true,
        durationSeconds: true,
        greenCount: true,
        yellowCount: true,
        redCount: true,
        missedCount: true,
        wordScores: true,
        feedback: true,
        grammarItems: true,
        azurePronunciationScore: true,
        azureAccuracyScore: true,
        azureFluencyScore: true,
        azureCompletenessScore: true,
        comprehensionAnswers: true,
      },
    });
    if (!row) return null;
    const wordScores = (row.wordScores ??
      []) as CreateReadingSessionInput['wordScores'];
    return {
      sessionId: row.id,
      wordScores,
      metrics: {
        wpm: row.wordsPerMinute ?? 0,
        accuracy: row.accuracy ?? 0,
        duration: row.durationSeconds ?? 0,
        greenCount: row.greenCount ?? 0,
        yellowCount: row.yellowCount ?? 0,
        redCount: row.redCount ?? 0,
        missedCount: row.missedCount ?? 0,
      },
      feedback: row.feedback as ReadingSessionFeedbackEntity | null,
      grammarItems: (row.grammarItems ?? []) as GrammarItemEntity[],
      azurePronunciationScore: row.azurePronunciationScore ?? undefined,
      azureAccuracyScore: row.azureAccuracyScore ?? undefined,
      azureFluencyScore: row.azureFluencyScore ?? undefined,
      azureCompletenessScore: row.azureCompletenessScore ?? undefined,
      comprehensionAnswers: (row.comprehensionAnswers ??
        null) as LastSessionResult['comprehensionAnswers'],
    };
  }

  async updateComprehensionAnswers(
    sessionId: string,
    userId: string,
    answers: Record<string, ComprehensionAnswerEntry>,
  ): Promise<boolean> {
    const updated = await this.dbClient
      .update(readingSessions)
      .set({
        comprehensionAnswers: answers as unknown as Record<
          string,
          { answer: string; correct: boolean }
        >,
      })
      .where(
        and(
          eq(readingSessions.id, sessionId),
          eq(readingSessions.userId, userId),
        ),
      )
      .returning({ id: readingSessions.id });
    return updated.length > 0;
  }

  async updateFeedback(
    sessionId: string,
    userId: string,
    feedback: ReadingSessionFeedbackEntity,
    grammarItems: GrammarItemEntity[],
  ): Promise<boolean> {
    const updated = await this.dbClient
      .update(readingSessions)
      .set({
        feedback,
        grammarItems: grammarItems as unknown as Record<string, unknown>[],
      })
      .where(
        and(
          eq(readingSessions.id, sessionId),
          eq(readingSessions.userId, userId),
        ),
      )
      .returning({ id: readingSessions.id });
    return updated.length > 0;
  }

  private toEntity(row: {
    id: string;
    userId: string;
    textId: string;
    wordsPerMinute: number | null;
    accuracy: number | null;
    durationSeconds: number | null;
    wordsRead: number | null;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    missedCount: number;
    wordScores: unknown;
    feedback: unknown;
    grammarItems: unknown;
    azurePronunciationScore?: number | null;
    azureAccuracyScore?: number | null;
    azureFluencyScore?: number | null;
    azureCompletenessScore?: number | null;
    status: string;
    completedAt: Date | null;
  }): ReadingSessionEntity {
    return {
      id: row.id,
      userId: row.userId,
      textId: row.textId,
      wordsPerMinute: row.wordsPerMinute,
      accuracy: row.accuracy,
      durationSeconds: row.durationSeconds,
      wordsRead: row.wordsRead,
      greenCount: row.greenCount,
      yellowCount: row.yellowCount,
      redCount: row.redCount,
      missedCount: row.missedCount,
      wordScores: row.wordScores as ReadingSessionEntity['wordScores'],
      feedback: row.feedback as ReadingSessionEntity['feedback'],
      grammarItems: row.grammarItems as ReadingSessionEntity['grammarItems'],
      azurePronunciationScore: row.azurePronunciationScore ?? undefined,
      azureAccuracyScore: row.azureAccuracyScore ?? undefined,
      azureFluencyScore: row.azureFluencyScore ?? undefined,
      azureCompletenessScore: row.azureCompletenessScore ?? undefined,
      status: row.status,
      completedAt: row.completedAt,
    };
  }
}
