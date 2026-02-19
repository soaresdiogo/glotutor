import type { ICompleteLessonUseCase } from '@/features/native-lessons/application/use-cases/complete-lesson.use-case';
import { CompleteLessonUseCase } from '@/features/native-lessons/application/use-cases/complete-lesson.use-case';
import { DrizzleNativeLessonRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson.repository';
import { DrizzleNativeLessonProgressRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson-progress.repository';

import { db } from '@/infrastructure/db/client';

export function makeCompleteLessonUseCase(): ICompleteLessonUseCase {
  return new CompleteLessonUseCase(
    new DrizzleNativeLessonRepository(db),
    new DrizzleNativeLessonProgressRepository(db),
  );
}
