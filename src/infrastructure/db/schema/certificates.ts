import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 10 }).notNull(),
  cefrLevel: varchar('cefr_level', { length: 5 }).notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  languageName: varchar('language_name', { length: 100 }).notNull(),
  levelName: varchar('level_name', { length: 100 }).notNull(),
  totalStudyMinutes: integer('total_study_minutes').notNull().default(0),
  completedAt: timestamp('completed_at').notNull(),
  verificationCode: varchar('verification_code', { length: 32 })
    .notNull()
    .unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
