import type { IGetLanguageStudyStatsUseCase } from '@/features/user-languages/application/use-cases/get-language-study-stats.use-case';
import { GetLanguageStudyStatsUseCase } from '@/features/user-languages/application/use-cases/get-language-study-stats.use-case';
import { DrizzleUserLanguageProgressRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-progress.repository';
import { DrizzleUserLanguageStreakRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-streak.repository';
import { DrizzleUserLanguageStudyTimeRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-study-time.repository';
import { db } from '@/infrastructure/db/client';

export function makeGetLanguageStudyStatsUseCase(): IGetLanguageStudyStatsUseCase {
  return new GetLanguageStudyStatsUseCase(
    new DrizzleUserLanguageProgressRepository(db),
    new DrizzleUserLanguageStreakRepository(db),
    new DrizzleUserLanguageStudyTimeRepository(db),
  );
}
