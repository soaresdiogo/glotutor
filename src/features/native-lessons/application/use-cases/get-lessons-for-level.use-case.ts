import type { LessonListItemDTO } from '@/features/native-lessons/application/dto/lesson-list-item.dto';
import type { INativeLessonRepository } from '@/features/native-lessons/domain/repositories/native-lesson.repository.interface';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';

export interface IGetLessonsForLevelUseCase {
  execute(
    userId: string,
    language: string,
    level: string,
  ): Promise<LessonListItemDTO[]>;
}

export class GetLessonsForLevelUseCase implements IGetLessonsForLevelUseCase {
  constructor(
    private readonly lessonRepo: INativeLessonRepository,
    private readonly progressRepo: INativeLessonProgressRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
    level: string,
  ): Promise<LessonListItemDTO[]> {
    let lessons = await this.lessonRepo.findByLanguageAndLevel(language, level);
    if (lessons.length === 0 && language !== 'en') {
      lessons = await this.lessonRepo.findByLanguageAndLevel('en', level);
    }
    const progressList = await this.progressRepo.findByUser(userId);
    const progressByLesson = new Map(progressList.map((p) => [p.lessonId, p]));
    return lessons.map((l) => {
      const p = progressByLesson.get(l.id);
      return {
        id: l.id,
        title: l.title,
        description: l.description,
        level: l.level,
        language: l.language,
        sortOrder: l.sortOrder,
        progress: p
          ? {
              status: p.status as LessonListItemDTO['progress'] extends
                | { status: infer S }
                | undefined
                ? S
                : never,
              score: p.score,
              completedAt: p.completedAt,
            }
          : undefined,
      };
    });
  }
}
