import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { lessons } from './lessons';
import { users } from './users';

export const studentLessonProgress = pgTable(
  'student_lesson_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('locked'),
    attempts: integer('attempts').notNull().default(0),
    bestScore: real('best_score'),
    lastScore: real('last_score'),
    timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
    exerciseResults: jsonb('exercise_results'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('slp_user_lesson_unique').on(t.userId, t.lessonId),
    index('slp_user_idx').on(t.userId),
    index('slp_status_idx').on(t.userId, t.status),
  ],
);
