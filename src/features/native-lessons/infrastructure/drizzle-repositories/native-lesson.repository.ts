import { and, eq, sql } from 'drizzle-orm';
import type { NativeLessonEntity } from '@/features/native-lessons/domain/entities/native-lesson.entity';
import type {
  INativeLessonRepository,
  LessonMeta,
} from '@/features/native-lessons/domain/repositories/native-lesson.repository.interface';
import { nativeLessons } from '@/infrastructure/db/schema/native-lessons';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  language: string;
  level: string;
  title: string;
  description: string | null;
  sortOrder: number;
  content: unknown;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}): NativeLessonEntity {
  return {
    id: row.id,
    language: row.language,
    level: row.level,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder,
    content: row.content as NativeLessonEntity['content'],
    isPublished: row.isPublished,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleNativeLessonRepository implements INativeLessonRepository {
  constructor(private readonly dbClient: DbClient) {}

  async findByLanguageAndLevel(
    language: string,
    level: string,
  ): Promise<NativeLessonEntity[]> {
    const rows = await this.dbClient.query.nativeLessons.findMany({
      where: and(
        eq(nativeLessons.language, language),
        eq(nativeLessons.level, level),
        eq(nativeLessons.isPublished, true),
      ),
      orderBy: (t, { asc }) => [asc(t.sortOrder)],
    });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<NativeLessonEntity | null> {
    const row = await this.dbClient.query.nativeLessons.findFirst({
      where: eq(nativeLessons.id, id),
    });
    return row ? toEntity(row) : null;
  }

  async getMeta(id: string): Promise<LessonMeta | null> {
    const rows = await this.dbClient
      .select({
        isPublished: nativeLessons.isPublished,
        exerciseCount: sql<number>`coalesce(jsonb_array_length(${nativeLessons.content}->'exercises'), 0)::int`,
      })
      .from(nativeLessons)
      .where(eq(nativeLessons.id, id))
      .limit(1);
    const row = rows[0];
    return row
      ? {
          isPublished: row.isPublished,
          exerciseCount: row.exerciseCount ?? 0,
        }
      : null;
  }

  async create(lesson: {
    language: string;
    level: string;
    title: string;
    description: string | null;
    sortOrder: number;
    content: unknown;
    isPublished: boolean;
  }): Promise<NativeLessonEntity> {
    const [inserted] = await this.dbClient
      .insert(nativeLessons)
      .values({
        language: lesson.language,
        level: lesson.level,
        title: lesson.title,
        description: lesson.description,
        sortOrder: lesson.sortOrder,
        content: lesson.content as Record<string, unknown>,
        isPublished: lesson.isPublished,
      })
      .returning();
    if (!inserted) throw new Error('Failed to create native lesson');
    return toEntity(inserted);
  }
}
