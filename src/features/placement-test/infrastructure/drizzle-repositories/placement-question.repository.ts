import { and, eq, notInArray, sql } from 'drizzle-orm';
import type { PlacementQuestionEntity } from '@/features/placement-test/domain/entities/placement-question.entity';
import type { IPlacementQuestionRepository } from '@/features/placement-test/domain/repositories/placement-question.repository.interface';
import { placementTestQuestions } from '@/infrastructure/db/schema/placement-test-questions';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  language: string;
  cefrLevel: string;
  questionType: string;
  questionText: string;
  audioUrl: string | null;
  options: string[];
  correctOptionIndex: number;
  questionPool?: string;
  createdAt: Date;
  updatedAt: Date;
}): PlacementQuestionEntity {
  return {
    id: row.id,
    language: row.language,
    cefrLevel: row.cefrLevel,
    questionType: row.questionType as PlacementQuestionEntity['questionType'],
    questionText: row.questionText,
    audioUrl: row.audioUrl,
    options: row.options,
    correctOptionIndex: row.correctOptionIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzlePlacementQuestionRepository
  implements IPlacementQuestionRepository
{
  constructor(private readonly db: DbClient) {}

  async findById(id: string): Promise<PlacementQuestionEntity | null> {
    const row = await this.db.query.placementTestQuestions.findFirst({
      where: eq(placementTestQuestions.id, id),
    });
    return row ? toEntity(row) : null;
  }

  async findRandomByLanguageAndLevel(
    language: string,
    cefrLevel: string,
    limit: number,
    excludeIds: string[] = [],
  ): Promise<PlacementQuestionEntity[]> {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/585dfbd9-11ed-4a7b-8723-960821f4c7ae', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'eff39f',
      },
      body: JSON.stringify({
        sessionId: 'eff39f',
        location: 'placement-question.repository.ts:findRandom',
        message: 'findRandomByLanguageAndLevel params',
        data: {
          language,
          cefrLevel,
          limit,
          excludeIdsLength: excludeIds.length,
        },
        timestamp: Date.now(),
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    const conditions = [
      eq(placementTestQuestions.language, language),
      eq(placementTestQuestions.cefrLevel, cefrLevel),
      eq(placementTestQuestions.questionPool, 'placement'),
    ];
    if (excludeIds.length > 0) {
      conditions.push(notInArray(placementTestQuestions.id, excludeIds));
    }
    const rows = await this.db
      .select()
      .from(placementTestQuestions)
      .where(and(...conditions))
      .orderBy(sql`random()`)
      .limit(limit);
    // #region agent log
    let countSameLangLevel: number | undefined;
    if (rows.length === 0) {
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(placementTestQuestions)
        .where(
          and(
            eq(placementTestQuestions.language, language),
            eq(placementTestQuestions.cefrLevel, cefrLevel),
          ),
        );
      countSameLangLevel = countResult[0]?.count ?? 0;
    }
    fetch('http://127.0.0.1:7244/ingest/585dfbd9-11ed-4a7b-8723-960821f4c7ae', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'eff39f',
      },
      body: JSON.stringify({
        sessionId: 'eff39f',
        location: 'placement-question.repository.ts:findRandomResult',
        message: 'findRandomByLanguageAndLevel result',
        data: { rowsLength: rows.length, countSameLangLevel },
        timestamp: Date.now(),
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    return rows.map(toEntity);
  }

  async findRandomCertificationByLanguageAndLevel(
    language: string,
    cefrLevel: string,
    limit: number,
    excludeIds: string[] = [],
  ): Promise<PlacementQuestionEntity[]> {
    const conditions = [
      eq(placementTestQuestions.language, language),
      eq(placementTestQuestions.cefrLevel, cefrLevel),
      eq(placementTestQuestions.questionPool, 'certification'),
    ];
    if (excludeIds.length > 0) {
      conditions.push(notInArray(placementTestQuestions.id, excludeIds));
    }
    const rows = await this.db
      .select()
      .from(placementTestQuestions)
      .where(and(...conditions))
      .orderBy(sql`random()`)
      .limit(limit);
    return rows.map(toEntity);
  }
}
