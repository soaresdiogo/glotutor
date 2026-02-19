import type { IContentTotalsProvider } from '@/features/level-progress/domain/ports/content-totals-provider.interface';
import type {
  ActivityType,
  ILevelProgressRepository,
} from '@/features/level-progress/domain/repositories/level-progress.repository.interface';
import type { IUserLanguageStreakRepository } from '@/features/user-languages/domain/repositories/user-language-streak.repository.interface';
import type { IUserLanguageStudyTimeRepository } from '@/features/user-languages/domain/repositories/user-language-study-time.repository.interface';

const CERTIFICATION_ELIGIBILITY_PERCENT = 80;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type CompleteActivityInput = {
  userId: string;
  language: string;
  cefrLevel: string;
  activityType: ActivityType;
  durationMinutes: number;
};

export interface ICompleteActivityUseCase {
  execute(input: CompleteActivityInput): Promise<void>;
}

export class CompleteActivityUseCase implements ICompleteActivityUseCase {
  constructor(
    private readonly levelProgressRepo: ILevelProgressRepository,
    private readonly contentTotals: IContentTotalsProvider,
    private readonly streakRepo: IUserLanguageStreakRepository,
    private readonly studyTimeRepo: IUserLanguageStudyTimeRepository,
  ) {}

  async execute(input: CompleteActivityInput): Promise<void> {
    const { userId, language, cefrLevel, activityType, durationMinutes } =
      input;

    let row = await this.levelProgressRepo.findByUserLanguageLevel(
      userId,
      language,
      cefrLevel,
    );

    if (!row) {
      const totals = await this.contentTotals.getTotals(language, cefrLevel);
      const newRow = await this.levelProgressRepo.create({
        userId,
        language,
        cefrLevel,
        lessonsTotal: totals.lessonsTotal,
        podcastsTotal: totals.podcastsTotal,
        readingsTotal: totals.readingsTotal,
        conversationsTotal: totals.conversationsTotal,
      });
      row = newRow;
    }

    await this.levelProgressRepo.incrementCompleted(row.id, activityType);

    const updated = await this.levelProgressRepo.findByUserLanguageLevel(
      userId,
      language,
      cefrLevel,
    );
    if (!updated) return;

    const totalActivities =
      updated.lessonsTotal +
      updated.podcastsTotal +
      updated.readingsTotal +
      updated.conversationsTotal;
    const completedActivities =
      updated.lessonsCompleted +
      updated.podcastsCompleted +
      updated.readingsCompleted +
      updated.conversationsCompleted;
    const completionPercentage =
      totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 10000) / 100
        : 0;
    const certificationUnlocked =
      updated.certificationUnlocked ||
      completionPercentage >= CERTIFICATION_ELIGIBILITY_PERCENT;

    await this.levelProgressRepo.updateCompletionAndCertification(
      updated.id,
      completionPercentage,
      certificationUnlocked,
    );

    const activityAt = new Date();
    const today = activityAt.toISOString().slice(0, 10);
    const existingStreak = await this.streakRepo.findByUserAndLanguage(
      userId,
      language,
    );

    let currentStreakDays = 1;
    let longestStreakDays = 1;

    if (existingStreak?.lastActivityAt) {
      const lastDate = existingStreak.lastActivityAt.toISOString().slice(0, 10);
      const yesterday = new Date(activityAt.getTime() - MS_PER_DAY)
        .toISOString()
        .slice(0, 10);
      if (lastDate === today) {
        currentStreakDays = existingStreak.currentStreakDays;
        longestStreakDays = existingStreak.longestStreakDays;
      } else if (lastDate === yesterday) {
        currentStreakDays = existingStreak.currentStreakDays + 1;
        longestStreakDays = Math.max(
          existingStreak.longestStreakDays,
          currentStreakDays,
        );
      } else {
        longestStreakDays = existingStreak.longestStreakDays;
      }
    }

    await this.streakRepo.upsert({
      userId,
      language,
      currentStreakDays,
      longestStreakDays,
      lastActivityAt: activityAt,
    });

    await this.studyTimeRepo.upsert(userId, language, today, {
      minutesStudied: durationMinutes,
      activitiesCompleted: 1,
    });
  }
}
