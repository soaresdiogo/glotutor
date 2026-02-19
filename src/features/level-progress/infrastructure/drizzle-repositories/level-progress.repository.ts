import { and, eq } from 'drizzle-orm';
import type {
  ActivityType,
  ILevelProgressRepository,
  LevelProgressRow,
} from '@/features/level-progress/domain/repositories/level-progress.repository.interface';
import { levelProgress } from '@/infrastructure/db/schema/level-progress';
import type { DbClient } from '@/infrastructure/db/types';

function toRow(row: {
  id: string;
  userId: string;
  language: string;
  cefrLevel: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  podcastsTotal: number;
  podcastsCompleted: number;
  readingsTotal: number;
  readingsCompleted: number;
  conversationsTotal: number;
  conversationsCompleted: number;
  completionPercentage: string | null;
  certificationUnlocked: boolean;
  certifiedAt: Date | null;
}): LevelProgressRow {
  return {
    id: row.id,
    userId: row.userId,
    language: row.language,
    cefrLevel: row.cefrLevel,
    lessonsTotal: row.lessonsTotal,
    lessonsCompleted: row.lessonsCompleted,
    podcastsTotal: row.podcastsTotal,
    podcastsCompleted: row.podcastsCompleted,
    readingsTotal: row.readingsTotal,
    readingsCompleted: row.readingsCompleted,
    conversationsTotal: row.conversationsTotal,
    conversationsCompleted: row.conversationsCompleted,
    completionPercentage: row.completionPercentage,
    certificationUnlocked: row.certificationUnlocked,
    certifiedAt: row.certifiedAt,
  };
}

export class DrizzleLevelProgressRepository
  implements ILevelProgressRepository
{
  constructor(private readonly db: DbClient) {}

  async findByUserLanguageLevel(
    userId: string,
    language: string,
    cefrLevel: string,
  ): Promise<LevelProgressRow | null> {
    const row = await this.db.query.levelProgress.findFirst({
      where: and(
        eq(levelProgress.userId, userId),
        eq(levelProgress.language, language),
        eq(levelProgress.cefrLevel, cefrLevel),
      ),
    });
    return row ? toRow(row) : null;
  }

  async create(data: {
    userId: string;
    language: string;
    cefrLevel: string;
    lessonsTotal: number;
    podcastsTotal: number;
    readingsTotal: number;
    conversationsTotal: number;
  }): Promise<LevelProgressRow> {
    const [row] = await this.db
      .insert(levelProgress)
      .values({
        userId: data.userId,
        language: data.language,
        cefrLevel: data.cefrLevel,
        lessonsTotal: data.lessonsTotal,
        podcastsTotal: data.podcastsTotal,
        readingsTotal: data.readingsTotal,
        conversationsTotal: data.conversationsTotal,
      })
      .returning();
    if (!row) throw new Error('Failed to create level progress');
    return toRow(row);
  }

  async incrementCompleted(
    id: string,
    activityType: ActivityType,
  ): Promise<LevelProgressRow> {
    const current = await this.db.query.levelProgress.findFirst({
      where: eq(levelProgress.id, id),
    });
    if (!current) throw new Error('Level progress not found for increment');

    switch (activityType) {
      case 'lesson': {
        const [row] = await this.db
          .update(levelProgress)
          .set({
            lessonsCompleted: current.lessonsCompleted + 1,
            updatedAt: new Date(),
          })
          .where(eq(levelProgress.id, id))
          .returning();
        if (!row) throw new Error('Level progress not found for increment');
        return toRow(row);
      }
      case 'podcast': {
        const [row] = await this.db
          .update(levelProgress)
          .set({
            podcastsCompleted: current.podcastsCompleted + 1,
            updatedAt: new Date(),
          })
          .where(eq(levelProgress.id, id))
          .returning();
        if (!row) throw new Error('Level progress not found for increment');
        return toRow(row);
      }
      case 'reading': {
        const [row] = await this.db
          .update(levelProgress)
          .set({
            readingsCompleted: current.readingsCompleted + 1,
            updatedAt: new Date(),
          })
          .where(eq(levelProgress.id, id))
          .returning();
        if (!row) throw new Error('Level progress not found for increment');
        return toRow(row);
      }
      case 'conversation': {
        const [row] = await this.db
          .update(levelProgress)
          .set({
            conversationsCompleted: current.conversationsCompleted + 1,
            updatedAt: new Date(),
          })
          .where(eq(levelProgress.id, id))
          .returning();
        if (!row) throw new Error('Level progress not found for increment');
        return toRow(row);
      }
    }
  }

  async updateCompletionAndCertification(
    id: string,
    completionPercentage: number,
    certificationUnlocked: boolean,
  ): Promise<LevelProgressRow> {
    const [row] = await this.db
      .update(levelProgress)
      .set({
        completionPercentage: String(completionPercentage),
        certificationUnlocked,
        updatedAt: new Date(),
      })
      .where(eq(levelProgress.id, id))
      .returning();
    if (!row) throw new Error('Level progress not found for update');
    return toRow(row);
  }
}
