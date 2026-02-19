import {
  index,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { courses } from './courses';
import { users } from './users';

export const studentCourseEnrollments = pgTable(
  'student_course_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    progressPercentage: real('progress_percentage').notNull().default(0),
    enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('sce_user_course_unique').on(t.userId, t.courseId),
    index('sce_user_idx').on(t.userId),
  ],
);
