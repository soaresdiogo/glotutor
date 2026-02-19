import { env } from '@/env';
import type { ICheckDailyLimitUseCase } from '@/features/native-lessons/application/use-cases/check-daily-limit.use-case';
import { CheckDailyLimitUseCase } from '@/features/native-lessons/application/use-cases/check-daily-limit.use-case';
import { DrizzleNativeLessonProgressRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson-progress.repository';
import { db } from '@/infrastructure/db/client';

export function makeCheckDailyLimitUseCase(): ICheckDailyLimitUseCase {
  return new CheckDailyLimitUseCase(
    new DrizzleNativeLessonProgressRepository(db),
    env.MAX_DAILY_LESSONS ?? 1,
  );
}
