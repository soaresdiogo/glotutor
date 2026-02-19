import type { IRedoLessonUseCase } from '@/features/native-lessons/application/use-cases/redo-lesson.use-case';
import { RedoLessonUseCase } from '@/features/native-lessons/application/use-cases/redo-lesson.use-case';
import { DrizzleNativeLessonRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson.repository';
import { DrizzleNativeLessonProgressRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson-progress.repository';

import { db } from '@/infrastructure/db/client';

export function makeRedoLessonUseCase(): IRedoLessonUseCase {
  return new RedoLessonUseCase(
    new DrizzleNativeLessonRepository(db),
    new DrizzleNativeLessonProgressRepository(db),
  );
}
