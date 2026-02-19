import type { IGetLessonsForLevelUseCase } from '@/features/native-lessons/application/use-cases/get-lessons-for-level.use-case';
import { GetLessonsForLevelUseCase } from '@/features/native-lessons/application/use-cases/get-lessons-for-level.use-case';
import { DrizzleNativeLessonRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson.repository';
import { DrizzleNativeLessonProgressRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson-progress.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetLessonsForLevelUseCase(): IGetLessonsForLevelUseCase {
  return new GetLessonsForLevelUseCase(
    new DrizzleNativeLessonRepository(db),
    new DrizzleNativeLessonProgressRepository(db),
  );
}
