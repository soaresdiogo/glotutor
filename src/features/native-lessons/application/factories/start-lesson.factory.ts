import { makeCheckDailyLimitUseCase } from '@/features/native-lessons/application/factories/check-daily-limit.factory';
import type { IStartLessonUseCase } from '@/features/native-lessons/application/use-cases/start-lesson.use-case';
import { StartLessonUseCase } from '@/features/native-lessons/application/use-cases/start-lesson.use-case';
import { DrizzleNativeLessonRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson.repository';
import { DrizzleNativeLessonProgressRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson-progress.repository';

import { db } from '@/infrastructure/db/client';

export function makeStartLessonUseCase(): IStartLessonUseCase {
  const checkDailyLimitUseCase = makeCheckDailyLimitUseCase();
  return new StartLessonUseCase(
    new DrizzleNativeLessonRepository(db),
    new DrizzleNativeLessonProgressRepository(db),
    (userId) =>
      checkDailyLimitUseCase.execute(userId).then((r) => ({
        canStartNew: r.canStartNew,
      })),
  );
}
