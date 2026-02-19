import { and, eq } from 'drizzle-orm';
import type { StudentPodcastProgressEntity } from '@/features/listening/domain/entities/student-podcast-progress.entity';
import type { IStudentPodcastProgressRepository } from '@/features/listening/domain/repositories/student-podcast-progress-repository.interface';
import { studentPodcastProgress } from '@/infrastructure/db/schema/student-podcast-progress';
import type { DbClient } from '@/infrastructure/db/types';

export class StudentPodcastProgressRepository
  implements IStudentPodcastProgressRepository
{
  constructor(private readonly dbClient: DbClient) {}

  async findByUserAndPodcast(
    userId: string,
    podcastId: string,
  ): Promise<StudentPodcastProgressEntity | null> {
    const row = await this.dbClient.query.studentPodcastProgress.findFirst({
      where: and(
        eq(studentPodcastProgress.userId, userId),
        eq(studentPodcastProgress.podcastId, podcastId),
      ),
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async upsertProgress(
    userId: string,
    podcastId: string,
    listenedPercentage: number,
  ): Promise<StudentPodcastProgressEntity> {
    const existing = await this.findByUserAndPodcast(userId, podcastId);
    const completedAt =
      listenedPercentage >= 100 ? new Date() : (existing?.completedAt ?? null);

    if (existing) {
      const [updated] = await this.dbClient
        .update(studentPodcastProgress)
        .set({
          listenedPercentage: Math.max(
            existing.listenedPercentage,
            listenedPercentage,
          ),
          completedAt: completedAt ?? undefined,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(studentPodcastProgress.userId, userId),
            eq(studentPodcastProgress.podcastId, podcastId),
          ),
        )
        .returning();
      if (!updated) throw new Error('Failed to update progress');
      return this.toEntity(updated);
    }

    const [inserted] = await this.dbClient
      .insert(studentPodcastProgress)
      .values({
        userId,
        podcastId,
        listenedPercentage,
        completedAt: completedAt ?? undefined,
      })
      .returning();
    if (!inserted) throw new Error('Failed to create progress');
    return this.toEntity(inserted);
  }

  async updateExerciseResults(
    userId: string,
    podcastId: string,
    data: {
      exerciseScore: number;
      totalQuestions: number;
      exerciseAnswers: Array<{ questionNumber: number; answer: string }>;
      exerciseFeedback: StudentPodcastProgressEntity['exerciseFeedback'];
    },
  ): Promise<StudentPodcastProgressEntity | null> {
    const [updated] = await this.dbClient
      .update(studentPodcastProgress)
      .set({
        exerciseScore: data.exerciseScore,
        totalQuestions: data.totalQuestions,
        exerciseCompletedAt: new Date(),
        exerciseAnswers: data.exerciseAnswers,
        exerciseFeedback: data.exerciseFeedback,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(studentPodcastProgress.userId, userId),
          eq(studentPodcastProgress.podcastId, podcastId),
        ),
      )
      .returning();
    if (!updated) return null;
    return this.toEntity(updated);
  }

  private toEntity(row: {
    id: string;
    userId: string;
    podcastId: string;
    listenedPercentage: number;
    completedAt: Date | null;
    exerciseScore: number | null;
    totalQuestions: number | null;
    exerciseCompletedAt: Date | null;
    exerciseAnswers: Array<{ questionNumber: number; answer: string }> | null;
    exerciseFeedback: StudentPodcastProgressEntity['exerciseFeedback'];
    createdAt: Date;
    updatedAt: Date;
  }): StudentPodcastProgressEntity {
    return {
      id: row.id,
      userId: row.userId,
      podcastId: row.podcastId,
      listenedPercentage: row.listenedPercentage,
      completedAt: row.completedAt,
      exerciseScore: row.exerciseScore,
      totalQuestions: row.totalQuestions ?? null,
      exerciseCompletedAt: row.exerciseCompletedAt,
      exerciseAnswers: row.exerciseAnswers,
      exerciseFeedback: row.exerciseFeedback,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
