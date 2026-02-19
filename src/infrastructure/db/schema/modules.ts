import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const modules = pgTable(
  'modules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    totalLessons: integer('total_lessons').default(0),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    unlockRule: varchar('unlock_rule', { length: 20 })
      .notNull()
      .default('sequential'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('modules_course_idx').on(t.courseId),
    index('modules_sort_idx').on(t.courseId, t.sortOrder),
  ],
);
