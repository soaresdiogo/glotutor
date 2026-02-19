import type { INativeLessonRepository } from '@/features/native-lessons/domain/repositories/native-lesson.repository.interface';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

export interface IStartLessonUseCase {
  execute(
    userId: string,
    lessonId: string,
  ): Promise<{ status: string; startedAt: Date | null }>;
}

export class StartLessonUseCase implements IStartLessonUseCase {
  constructor(
    private readonly lessonRepo: INativeLessonRepository,
    private readonly progressRepo: INativeLessonProgressRepository,
    private readonly checkDailyLimit: (
      userId: string,
    ) => Promise<{ canStartNew: boolean }>,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
  ): Promise<{ status: string; startedAt: Date | null }> {
    const limit = await this.checkDailyLimit(userId);
    if (!limit.canStartNew) {
      throw new BadRequestError(
        'Daily lesson limit reached. Try again tomorrow.',
        'nativeLessons.dailyLimitReached',
      );
    }
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson || !lesson.isPublished) {
      throw new BadRequestError(
        'Lesson not found.',
        'nativeLessons.lessonNotFound',
      );
    }
    const now = new Date();
    const progress = await this.progressRepo.upsert({
      userId,
      lessonId,
      status: 'in_progress',
      startedAt: now,
    });
    return {
      status: progress.status,
      startedAt: progress.startedAt,
    };
  }
}
