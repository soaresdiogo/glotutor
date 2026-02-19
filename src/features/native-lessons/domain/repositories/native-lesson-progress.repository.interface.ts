import type { NativeLessonProgressEntity } from '../entities/native-lesson-progress.entity';

export interface INativeLessonProgressRepository {
  findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<NativeLessonProgressEntity | null>;

  findByUser(userId: string): Promise<NativeLessonProgressEntity[]>;

  countCompletedToday(userId: string): Promise<number>;

  upsert(progress: {
    userId: string;
    lessonId: string;
    status: NativeLessonProgressEntity['status'];
    score?: number | null;
    exerciseResults?: unknown | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
  }): Promise<NativeLessonProgressEntity>;
}
