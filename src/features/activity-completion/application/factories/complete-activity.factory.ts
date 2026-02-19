import type { ICompleteActivityUseCase } from '@/features/activity-completion/application/use-cases/complete-activity.use-case';
import { CompleteActivityUseCase } from '@/features/activity-completion/application/use-cases/complete-activity.use-case';
import { DrizzleLevelProgressRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/level-progress.repository';
import { ContentTotalsProvider } from '@/features/level-progress/infrastructure/providers/content-totals.provider';
import { DrizzleUserLanguageStreakRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-streak.repository';
import { DrizzleUserLanguageStudyTimeRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-study-time.repository';
import { db } from '@/infrastructure/db/client';

export function makeCompleteActivityUseCase(): ICompleteActivityUseCase {
  return new CompleteActivityUseCase(
    new DrizzleLevelProgressRepository(db),
    new ContentTotalsProvider(db),
    new DrizzleUserLanguageStreakRepository(db),
    new DrizzleUserLanguageStudyTimeRepository(db),
  );
}
