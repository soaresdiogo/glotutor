import { and, eq } from 'drizzle-orm';
import type { UserLanguageProgressEntity } from '@/features/user-languages/domain/entities/user-language-progress.entity';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import { userLanguageProgress } from '@/infrastructure/db/schema/user-language-progress';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  userId: string;
  language: string;
  currentLevel: string;
  placementTestId: string | null;
  isActive: boolean;
  startedAt: Date;
  updatedAt: Date;
}): UserLanguageProgressEntity {
  return {
    id: row.id,
    userId: row.userId,
    language: row.language,
    currentLevel: row.currentLevel,
    placementTestId: row.placementTestId,
    isActive: row.isActive,
    startedAt: row.startedAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleUserLanguageProgressRepository
  implements IUserLanguageProgressRepository
{
  constructor(private readonly db: DbClient) {}

  async create(data: {
    userId: string;
    language: string;
    currentLevel: string;
    placementTestId?: string | null;
  }): Promise<UserLanguageProgressEntity> {
    const [row] = await this.db
      .insert(userLanguageProgress)
      .values({
        userId: data.userId,
        language: data.language,
        currentLevel: data.currentLevel,
        placementTestId: data.placementTestId ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create user language progress');
    return toEntity(row);
  }

  async findByUserAndLanguage(
    userId: string,
    language: string,
  ): Promise<UserLanguageProgressEntity | null> {
    const row = await this.db.query.userLanguageProgress.findFirst({
      where: and(
        eq(userLanguageProgress.userId, userId),
        eq(userLanguageProgress.language, language),
      ),
    });
    return row ? toEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<UserLanguageProgressEntity[]> {
    const rows = await this.db.query.userLanguageProgress.findMany({
      where: eq(userLanguageProgress.userId, userId),
    });
    return rows.map(toEntity);
  }

  async updateLevel(
    id: string,
    currentLevel: string,
  ): Promise<UserLanguageProgressEntity> {
    const [row] = await this.db
      .update(userLanguageProgress)
      .set({ currentLevel, updatedAt: new Date() })
      .where(eq(userLanguageProgress.id, id))
      .returning();
    if (!row) throw new Error('User language progress not found for update');
    return toEntity(row);
  }

  async hasAnyByUserId(userId: string): Promise<boolean> {
    const row = await this.db.query.userLanguageProgress.findFirst({
      where: eq(userLanguageProgress.userId, userId),
      columns: { id: true },
    });
    return !!row;
  }
}
