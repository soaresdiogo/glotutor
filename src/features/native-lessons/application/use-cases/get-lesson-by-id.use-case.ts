import type { LessonDetailDTO } from '@/features/native-lessons/application/dto/lesson-detail.dto';
import type { INativeLessonRepository } from '@/features/native-lessons/domain/repositories/native-lesson.repository.interface';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface IGetLessonByIdUseCase {
  execute(lessonId: string, userId: string): Promise<LessonDetailDTO>;
}

export class GetLessonByIdUseCase implements IGetLessonByIdUseCase {
  constructor(
    private readonly lessonRepo: INativeLessonRepository,
    private readonly progressRepo: INativeLessonProgressRepository,
  ) {}

  async execute(lessonId: string, userId: string): Promise<LessonDetailDTO> {
    const [lesson, progress] = await Promise.all([
      this.lessonRepo.findById(lessonId),
      this.progressRepo.findByUserAndLesson(userId, lessonId),
    ]);
    if (!lesson) {
      throw new NotFoundError(
        'Lesson not found.',
        'nativeLessons.lessonNotFound',
      );
    }
    if (!lesson.isPublished) {
      throw new NotFoundError(
        'Lesson not found.',
        'nativeLessons.lessonNotFound',
      );
    }
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      level: lesson.level,
      language: lesson.language,
      sortOrder: lesson.sortOrder,
      content: lesson.content,
      progress: progress
        ? {
            status: progress.status,
            score: progress.score,
            startedAt: progress.startedAt,
            completedAt: progress.completedAt,
            exerciseResults: progress.exerciseResults,
          }
        : undefined,
    };
  }
}
