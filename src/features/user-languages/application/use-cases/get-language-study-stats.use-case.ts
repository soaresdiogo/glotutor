import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import type { IUserLanguageStreakRepository } from '@/features/user-languages/domain/repositories/user-language-streak.repository.interface';
import type { IUserLanguageStudyTimeRepository } from '@/features/user-languages/domain/repositories/user-language-study-time.repository.interface';

export type DailyMinutes = { date: string; minutes: number };

export type LanguageStudyStats = {
  language: string;
  currentLevel: string;
  totalMinutes: number;
  thisWeekMinutes: number;
  currentStreakDays: number;
  longestStreakDays: number;
  /** Minutes studied per day for the current week (for charts). */
  weeklyDailyMinutes: DailyMinutes[];
};

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start.toISOString().slice(0, 10);
}

export interface IGetLanguageStudyStatsUseCase {
  execute(userId: string): Promise<LanguageStudyStats[]>;
}

export class GetLanguageStudyStatsUseCase
  implements IGetLanguageStudyStatsUseCase
{
  constructor(
    private readonly progressRepo: IUserLanguageProgressRepository,
    private readonly streakRepo: IUserLanguageStreakRepository,
    private readonly studyTimeRepo: IUserLanguageStudyTimeRepository,
  ) {}

  async execute(userId: string): Promise<LanguageStudyStats[]> {
    const progressList = await this.progressRepo.findByUserId(userId);
    const endDate = new Date().toISOString().slice(0, 10);
    const startOfWeek = getStartOfWeek();

    const stats: LanguageStudyStats[] = await Promise.all(
      progressList.map(async (p) => {
        const [streak, weekRecords] = await Promise.all([
          this.streakRepo.findByUserAndLanguage(userId, p.language),
          this.studyTimeRepo.findByUserAndLanguageInDateRange(
            userId,
            p.language,
            startOfWeek,
            endDate,
          ),
        ]);

        const thisWeekMinutes = weekRecords.reduce(
          (sum, r) => sum + r.minutesStudied,
          0,
        );

        const allTimeRecords =
          await this.studyTimeRepo.findByUserAndLanguageInDateRange(
            userId,
            p.language,
            '1970-01-01',
            endDate,
          );
        const totalMinutes = allTimeRecords.reduce(
          (sum, r) => sum + r.minutesStudied,
          0,
        );

        const weeklyDailyMinutes = weekRecords.map((r) => ({
          date: r.date,
          minutes: r.minutesStudied,
        }));

        return {
          language: p.language,
          currentLevel: p.currentLevel,
          totalMinutes,
          thisWeekMinutes,
          currentStreakDays: streak?.currentStreakDays ?? 0,
          longestStreakDays: streak?.longestStreakDays ?? 0,
          weeklyDailyMinutes,
        };
      }),
    );

    return stats;
  }
}
