import type { NativeLessonEntity } from '../entities/native-lesson.entity';

export type LessonMeta = {
  isPublished: boolean;
  exerciseCount: number;
};

export interface INativeLessonRepository {
  findByLanguageAndLevel(
    language: string,
    level: string,
  ): Promise<NativeLessonEntity[]>;

  findById(id: string): Promise<NativeLessonEntity | null>;

  getMeta(id: string): Promise<LessonMeta | null>;

  create(lesson: {
    language: string;
    level: string;
    title: string;
    description: string | null;
    sortOrder: number;
    content: unknown;
    isPublished: boolean;
  }): Promise<NativeLessonEntity>;
}
