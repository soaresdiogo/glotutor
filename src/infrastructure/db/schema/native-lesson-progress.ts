import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { nativeLessons } from './native-lessons';
import { users } from './users';

export const nativeLessonProgress = pgTable(
  'native_lesson_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => nativeLessons.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('not_started'),
    score: integer('score'),
    exerciseResults: jsonb('exercise_results'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('nlp_user_lesson_unique').on(t.userId, t.lessonId),
    index('nlp_user_completed_at_idx').on(t.userId, t.completedAt),
  ],
);
