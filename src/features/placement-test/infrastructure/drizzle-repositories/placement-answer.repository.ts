import { eq } from 'drizzle-orm';
import type { PlacementAnswerEntity } from '@/features/placement-test/domain/entities/placement-answer.entity';
import type { IPlacementAnswerRepository } from '@/features/placement-test/domain/repositories/placement-answer.repository.interface';
import { placementTestAnswers } from '@/infrastructure/db/schema/placement-test-answers';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  cefrLevel: string;
  answeredAt: Date;
}): PlacementAnswerEntity {
  return {
    id: row.id,
    attemptId: row.attemptId,
    questionId: row.questionId,
    selectedOptionIndex: row.selectedOptionIndex,
    isCorrect: row.isCorrect,
    cefrLevel: row.cefrLevel,
    answeredAt: row.answeredAt,
  };
}

export class DrizzlePlacementAnswerRepository
  implements IPlacementAnswerRepository
{
  constructor(private readonly db: DbClient) {}

  async create(data: {
    attemptId: string;
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    cefrLevel: string;
  }): Promise<PlacementAnswerEntity> {
    const [row] = await this.db
      .insert(placementTestAnswers)
      .values({
        attemptId: data.attemptId,
        questionId: data.questionId,
        selectedOptionIndex: data.selectedOptionIndex,
        isCorrect: data.isCorrect,
        cefrLevel: data.cefrLevel,
      })
      .returning();
    if (!row) throw new Error('Failed to create placement answer');
    return toEntity(row);
  }

  async findByAttemptId(attemptId: string): Promise<PlacementAnswerEntity[]> {
    const rows = await this.db.query.placementTestAnswers.findMany({
      where: eq(placementTestAnswers.attemptId, attemptId),
    });
    return rows.map(toEntity);
  }
}
