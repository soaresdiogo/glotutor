import { eq } from 'drizzle-orm';
import type { PlacementAttemptEntity } from '@/features/placement-test/domain/entities/placement-attempt.entity';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import { placementTestAttempts } from '@/infrastructure/db/schema/placement-test-attempts';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  userId: string;
  language: string;
  status: string;
  recommendedLevel: string | null;
  selectedLevel: string | null;
  totalQuestions: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PlacementAttemptEntity {
  return {
    id: row.id,
    userId: row.userId,
    language: row.language,
    status: row.status as PlacementAttemptEntity['status'],
    recommendedLevel: row.recommendedLevel,
    selectedLevel: row.selectedLevel,
    totalQuestions: row.totalQuestions,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzlePlacementAttemptRepository
  implements IPlacementAttemptRepository
{
  constructor(private readonly db: DbClient) {}

  async create(data: {
    userId: string;
    language: string;
    totalQuestions: number;
  }): Promise<PlacementAttemptEntity> {
    const [row] = await this.db
      .insert(placementTestAttempts)
      .values({
        userId: data.userId,
        language: data.language,
        totalQuestions: data.totalQuestions,
      })
      .returning();
    if (!row) throw new Error('Failed to create placement attempt');
    return toEntity(row);
  }

  async findById(id: string): Promise<PlacementAttemptEntity | null> {
    const row = await this.db.query.placementTestAttempts.findFirst({
      where: eq(placementTestAttempts.id, id),
    });
    return row ? toEntity(row) : null;
  }

  async findInProgressByUserAndLanguage(
    userId: string,
    language: string,
  ): Promise<PlacementAttemptEntity | null> {
    const row = await this.db.query.placementTestAttempts.findFirst({
      where: (t, { and, eq }) =>
        and(
          eq(t.userId, userId),
          eq(t.language, language),
          eq(t.status, 'in_progress'),
        ),
    });
    return row ? toEntity(row) : null;
  }

  async update(
    id: string,
    data: {
      status?: PlacementAttemptEntity['status'];
      recommendedLevel?: string | null;
      selectedLevel?: string | null;
      totalQuestions?: number;
      completedAt?: Date | null;
    },
  ): Promise<PlacementAttemptEntity> {
    const [row] = await this.db
      .update(placementTestAttempts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(placementTestAttempts.id, id))
      .returning();
    if (!row) throw new Error('Placement attempt not found for update');
    return toEntity(row);
  }
}
