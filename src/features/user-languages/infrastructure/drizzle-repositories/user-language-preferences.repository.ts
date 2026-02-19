import { eq } from 'drizzle-orm';
import type { UserLanguagePreferencesEntity } from '@/features/user-languages/domain/entities/user-language-preferences.entity';
import type { IUserLanguagePreferencesRepository } from '@/features/user-languages/domain/repositories/user-language-preferences.repository.interface';
import { userLanguagePreferences } from '@/infrastructure/db/schema/user-language-preferences';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  userId: string;
  primaryLanguage: string;
  updatedAt: Date;
}): UserLanguagePreferencesEntity {
  return {
    id: row.id,
    userId: row.userId,
    primaryLanguage: row.primaryLanguage,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleUserLanguagePreferencesRepository
  implements IUserLanguagePreferencesRepository
{
  constructor(private readonly db: DbClient) {}

  async findById(
    userId: string,
  ): Promise<UserLanguagePreferencesEntity | null> {
    const row = await this.db.query.userLanguagePreferences.findFirst({
      where: eq(userLanguagePreferences.userId, userId),
    });
    return row ? toEntity(row) : null;
  }

  async upsert(
    userId: string,
    primaryLanguage: string,
  ): Promise<UserLanguagePreferencesEntity> {
    const existing = await this.findById(userId);
    if (existing) {
      const [row] = await this.db
        .update(userLanguagePreferences)
        .set({ primaryLanguage, updatedAt: new Date() })
        .where(eq(userLanguagePreferences.userId, userId))
        .returning();
      if (!row) throw new Error('Failed to update preferences');
      return toEntity(row);
    }
    const [row] = await this.db
      .insert(userLanguagePreferences)
      .values({ userId, primaryLanguage })
      .returning();
    if (!row) throw new Error('Failed to create preferences');
    return toEntity(row);
  }
}
