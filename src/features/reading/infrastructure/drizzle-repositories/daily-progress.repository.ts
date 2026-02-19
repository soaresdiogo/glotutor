import { eq } from 'drizzle-orm';

import type { IDailyProgressRepository } from '@/features/reading/domain/repositories/daily-progress-repository.interface';

import { dailyProgress } from '@/infrastructure/db/schema/daily-progress';
import type { DbClient } from '@/infrastructure/db/types';

export class DailyProgressRepository implements IDailyProgressRepository {
  constructor(private readonly dbClient: DbClient) {}

  async addReadingProgress(
    userId: string,
    date: string,
    readingMinutes: number,
    wordsPracticed: number,
  ): Promise<void> {
    const row = await this.dbClient.query.dailyProgress.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userId), eq(table.practiceDate, date)),
    });
    if (row) {
      await this.dbClient
        .update(dailyProgress)
        .set({
          readingMinutes: row.readingMinutes + readingMinutes,
          wordsPracticed: row.wordsPracticed + wordsPracticed,
        })
        .where(eq(dailyProgress.id, row.id));
    } else {
      await this.dbClient.insert(dailyProgress).values({
        userId,
        practiceDate: date,
        readingMinutes,
        wordsPracticed,
      });
    }
  }
}
