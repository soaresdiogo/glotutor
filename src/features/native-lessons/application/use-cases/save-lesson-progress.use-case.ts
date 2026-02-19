import type { LessonCompletionExerciseResult } from '@/features/native-lessons/application/dto/lesson-completion.dto';
import type { INativeLessonRepository } from '@/features/native-lessons/domain/repositories/native-lesson.repository.interface';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

export interface ISaveLessonProgressUseCase {
  execute(
    userId: string,
    lessonId: string,
    results: LessonCompletionExerciseResult[],
  ): Promise<{ status: string }>;
}

export class SaveLessonProgressUseCase implements ISaveLessonProgressUseCase {
  constructor(
    private readonly lessonRepo: INativeLessonRepository,
    private readonly progressRepo: INativeLessonProgressRepository,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
    results: LessonCompletionExerciseResult[],
  ): Promise<{ status: string }> {
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson?.isPublished) {
      throw new BadRequestError(
        'Lesson not found.',
        'nativeLessons.lessonNotFound',
      );
    }
    await this.progressRepo.upsert({
      userId,
      lessonId,
      status: 'in_progress',
      exerciseResults: results,
    });
    return { status: 'in_progress' };
  }
}
