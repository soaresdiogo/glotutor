import type { INativeLessonRepository } from '@/features/native-lessons/domain/repositories/native-lesson.repository.interface';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

export interface IRedoLessonUseCase {
  execute(userId: string, lessonId: string): Promise<{ status: string }>;
}

export class RedoLessonUseCase implements IRedoLessonUseCase {
  constructor(
    private readonly lessonRepo: INativeLessonRepository,
    private readonly progressRepo: INativeLessonProgressRepository,
  ) {}

  async execute(userId: string, lessonId: string): Promise<{ status: string }> {
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
      score: null,
      exerciseResults: null,
      completedAt: null,
    });
    return { status: 'in_progress' };
  }
}
