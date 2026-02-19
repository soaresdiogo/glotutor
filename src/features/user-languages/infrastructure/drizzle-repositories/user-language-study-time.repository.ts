import { and, eq, gte, lte } from 'drizzle-orm';
import type { IUserLanguageStudyTimeRepository } from '@/features/user-languages/domain/repositories/user-language-study-time.repository.interface';
import { userLanguageStudyTime } from '@/infrastructure/db/schema/user-language-study-time';
import type { DbClient } from '@/infrastructure/db/types';

export class DrizzleUserLanguageStudyTimeRepository
  implements IUserLanguageStudyTimeRepository
{
  constructor(private readonly db: DbClient) {}

  async findByUserAndLanguageInDateRange(
    userId: string,
    language: string,
    startDate: string,
    endDate: string,
  ) {
    const rows = await this.db
      .select({
        date: userLanguageStudyTime.date,
        minutesStudied: userLanguageStudyTime.minutesStudied,
        activitiesCompleted: userLanguageStudyTime.activitiesCompleted,
      })
      .from(userLanguageStudyTime)
      .where(
        and(
          eq(userLanguageStudyTime.userId, userId),
          eq(userLanguageStudyTime.language, language),
          gte(userLanguageStudyTime.date, startDate),
          lte(userLanguageStudyTime.date, endDate),
        ),
      );
    return rows as {
      date: string;
      minutesStudied: number;
      activitiesCompleted: number;
    }[];
  }

  async upsert(
    userId: string,
    language: string,
    date: string,
    data: { minutesStudied: number; activitiesCompleted: number },
  ): Promise<void> {
    const existing = await this.db.query.userLanguageStudyTime.findFirst({
      where: and(
        eq(userLanguageStudyTime.userId, userId),
        eq(userLanguageStudyTime.language, language),
        eq(userLanguageStudyTime.date, date),
      ),
    });
    if (existing) {
      await this.db
        .update(userLanguageStudyTime)
        .set({
          minutesStudied: existing.minutesStudied + data.minutesStudied,
          activitiesCompleted:
            existing.activitiesCompleted + data.activitiesCompleted,
        })
        .where(eq(userLanguageStudyTime.id, existing.id));
    } else {
      await this.db.insert(userLanguageStudyTime).values({
        userId,
        language,
        date,
        minutesStudied: data.minutesStudied,
        activitiesCompleted: data.activitiesCompleted,
      });
    }
  }
}
