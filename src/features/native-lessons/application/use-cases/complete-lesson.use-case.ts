import type { LessonCompletionExerciseResult } from '@/features/native-lessons/application/dto/lesson-completion.dto';
import type { INativeLessonRepository } from '@/features/native-lessons/domain/repositories/native-lesson.repository.interface';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

const MAX_POINTS_PER_EXERCISE = 10;

export interface ICompleteLessonUseCase {
  execute(
    userId: string,
    lessonId: string,
    results: LessonCompletionExerciseResult[],
  ): Promise<{ status: string; score: number; completedAt: Date | null }>;
}

export class CompleteLessonUseCase implements ICompleteLessonUseCase {
  constructor(
    private readonly lessonRepo: INativeLessonRepository,
    private readonly progressRepo: INativeLessonProgressRepository,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
    results: LessonCompletionExerciseResult[],
  ): Promise<{ status: string; score: number; completedAt: Date | null }> {
    const meta = await this.lessonRepo.getMeta(lessonId);
    if (!meta?.isPublished) {
      throw new BadRequestError(
        'Lesson not found.',
        'nativeLessons.lessonNotFound',
      );
    }
    const totalPoints = results.reduce(
      (sum, r) => sum + (r.score ?? (r.correct ? MAX_POINTS_PER_EXERCISE : 0)),
      0,
    );
    const maxPossible =
      (meta.exerciseCount > 0 ? meta.exerciseCount : results.length) *
      MAX_POINTS_PER_EXERCISE;
    const score = Math.round(
      maxPossible > 0 ? (totalPoints / maxPossible) * 100 : 0,
    );
    const now = new Date();
    await this.progressRepo.upsert({
      userId,
      lessonId,
      status: 'completed',
      score,
      exerciseResults: results,
      completedAt: now,
    });
    return {
      status: 'completed',
      score,
      completedAt: now,
    };
  }
}
