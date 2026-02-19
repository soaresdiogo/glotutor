import type { IGetLessonByIdUseCase } from '@/features/native-lessons/application/use-cases/get-lesson-by-id.use-case';
import { GetLessonByIdUseCase } from '@/features/native-lessons/application/use-cases/get-lesson-by-id.use-case';
import { DrizzleNativeLessonRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson.repository';
import { DrizzleNativeLessonProgressRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson-progress.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetLessonByIdUseCase(): IGetLessonByIdUseCase {
  return new GetLessonByIdUseCase(
    new DrizzleNativeLessonRepository(db),
    new DrizzleNativeLessonProgressRepository(db),
  );
}
