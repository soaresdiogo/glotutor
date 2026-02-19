import { and, eq } from 'drizzle-orm';
import type { UserLanguageStreakEntity } from '@/features/user-languages/domain/entities/user-language-streak.entity';
import type { IUserLanguageStreakRepository } from '@/features/user-languages/domain/repositories/user-language-streak.repository.interface';
import { userLanguageStreaks } from '@/infrastructure/db/schema/user-language-streaks';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  userId: string;
  language: string;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityAt: Date | null;
  updatedAt: Date;
}): UserLanguageStreakEntity {
  return {
    id: row.id,
    userId: row.userId,
    language: row.language,
    currentStreakDays: row.currentStreakDays,
    longestStreakDays: row.longestStreakDays,
    lastActivityAt: row.lastActivityAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleUserLanguageStreakRepository
  implements IUserLanguageStreakRepository
{
  constructor(private readonly db: DbClient) {}

  async findByUserAndLanguage(
    userId: string,
    language: string,
  ): Promise<UserLanguageStreakEntity | null> {
    const row = await this.db.query.userLanguageStreaks.findFirst({
      where: and(
        eq(userLanguageStreaks.userId, userId),
        eq(userLanguageStreaks.language, language),
      ),
    });
    return row ? toEntity(row) : null;
  }

  async upsert(data: {
    userId: string;
    language: string;
    currentStreakDays: number;
    longestStreakDays: number;
    lastActivityAt: Date | null;
  }): Promise<UserLanguageStreakEntity> {
    const existing = await this.findByUserAndLanguage(
      data.userId,
      data.language,
    );
    if (existing) {
      const [row] = await this.db
        .update(userLanguageStreaks)
        .set({
          currentStreakDays: data.currentStreakDays,
          longestStreakDays: data.longestStreakDays,
          lastActivityAt: data.lastActivityAt,
          updatedAt: new Date(),
        })
        .where(eq(userLanguageStreaks.id, existing.id))
        .returning();
      if (!row) throw new Error('Failed to update streak');
      return toEntity(row);
    }
    const [row] = await this.db
      .insert(userLanguageStreaks)
      .values({
        userId: data.userId,
        language: data.language,
        currentStreakDays: data.currentStreakDays,
        longestStreakDays: data.longestStreakDays,
        lastActivityAt: data.lastActivityAt,
      })
      .returning();
    if (!row) throw new Error('Failed to create streak');
    return toEntity(row);
  }
}
