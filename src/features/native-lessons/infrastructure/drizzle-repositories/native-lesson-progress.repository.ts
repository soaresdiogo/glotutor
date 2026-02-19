import { and, eq, gte, lt, sql } from 'drizzle-orm';
import type { NativeLessonProgressEntity } from '@/features/native-lessons/domain/entities/native-lesson-progress.entity';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';
import { nativeLessonProgress } from '@/infrastructure/db/schema/native-lesson-progress';
import type { DbClient } from '@/infrastructure/db/types';

function startOfTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfTodayUTC(): Date {
  const d = startOfTodayUTC();
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function toEntity(row: {
  id: string;
  userId: string;
  lessonId: string;
  status: string;
  score: number | null;
  exerciseResults: unknown;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): NativeLessonProgressEntity {
  return {
    id: row.id,
    userId: row.userId,
    lessonId: row.lessonId,
    status: row.status as NativeLessonProgressEntity['status'],
    score: row.score,
    exerciseResults: row.exerciseResults,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleNativeLessonProgressRepository
  implements INativeLessonProgressRepository
{
  constructor(private readonly dbClient: DbClient) {}

  async findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<NativeLessonProgressEntity | null> {
    const row = await this.dbClient.query.nativeLessonProgress.findFirst({
      where: and(
        eq(nativeLessonProgress.userId, userId),
        eq(nativeLessonProgress.lessonId, lessonId),
      ),
    });
    return row ? toEntity(row) : null;
  }

  async findByUser(userId: string): Promise<NativeLessonProgressEntity[]> {
    const rows = await this.dbClient.query.nativeLessonProgress.findMany({
      where: eq(nativeLessonProgress.userId, userId),
    });
    return rows.map(toEntity);
  }

  async countCompletedToday(userId: string): Promise<number> {
    const start = startOfTodayUTC();
    const end = endOfTodayUTC();
    const result = await this.dbClient
      .select({ count: sql<number>`count(*)::int` })
      .from(nativeLessonProgress)
      .where(
        and(
          eq(nativeLessonProgress.userId, userId),
          eq(nativeLessonProgress.status, 'completed'),
          gte(nativeLessonProgress.completedAt, start),
          lt(nativeLessonProgress.completedAt, end),
        ),
      );
    return result[0]?.count ?? 0;
  }

  async upsert(progress: {
    userId: string;
    lessonId: string;
    status: NativeLessonProgressEntity['status'];
    score?: number | null;
    exerciseResults?: unknown | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
  }): Promise<NativeLessonProgressEntity> {
    const existing = await this.findByUserAndLesson(
      progress.userId,
      progress.lessonId,
    );
    if (existing) {
      const [updated] = await this.dbClient
        .update(nativeLessonProgress)
        .set({
          status: progress.status,
          ...(progress.score !== undefined && { score: progress.score }),
          ...(progress.exerciseResults !== undefined && {
            exerciseResults: progress.exerciseResults as Record<
              string,
              unknown
            >,
          }),
          ...(progress.startedAt !== undefined && {
            startedAt: progress.startedAt ?? undefined,
          }),
          ...(progress.completedAt !== undefined && {
            completedAt: progress.completedAt ?? undefined,
          }),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(nativeLessonProgress.userId, progress.userId),
            eq(nativeLessonProgress.lessonId, progress.lessonId),
          ),
        )
        .returning();
      if (!updated) throw new Error('Failed to update native lesson progress');
      return toEntity(updated);
    }
    const [inserted] = await this.dbClient
      .insert(nativeLessonProgress)
      .values({
        userId: progress.userId,
        lessonId: progress.lessonId,
        status: progress.status,
        score: progress.score ?? undefined,
        exerciseResults: (progress.exerciseResults ?? undefined) as
          | Record<string, unknown>
          | undefined,
        startedAt: progress.startedAt ?? undefined,
        completedAt: progress.completedAt ?? undefined,
      })
      .returning();
    if (!inserted) throw new Error('Failed to create native lesson progress');
    return toEntity(inserted);
  }
}
