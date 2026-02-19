import type { ISaveLessonProgressUseCase } from '@/features/native-lessons/application/use-cases/save-lesson-progress.use-case';
import { SaveLessonProgressUseCase } from '@/features/native-lessons/application/use-cases/save-lesson-progress.use-case';
import { DrizzleNativeLessonRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson.repository';
import { DrizzleNativeLessonProgressRepository } from '@/features/native-lessons/infrastructure/drizzle-repositories/native-lesson-progress.repository';

import { db } from '@/infrastructure/db/client';

export function makeSaveLessonProgressUseCase(): ISaveLessonProgressUseCase {
  return new SaveLessonProgressUseCase(
    new DrizzleNativeLessonRepository(db),
    new DrizzleNativeLessonProgressRepository(db),
  );
}
