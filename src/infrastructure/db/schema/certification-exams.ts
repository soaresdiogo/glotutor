import {
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

const EXAM_STATUS = ['in_progress', 'passed', 'failed'] as const;
export type CertificationExamStatus = (typeof EXAM_STATUS)[number];

export const certificationExams = pgTable(
  'certification_exams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('in_progress'),
    score: numeric('score', { precision: 5, scale: 2 }),
    totalQuestions: integer('total_questions').notNull().default(0),
    correctAnswers: integer('correct_answers').notNull().default(0),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('ce_user_lang_level_idx').on(t.userId, t.language, t.cefrLevel),
    index('ce_user_status_idx').on(t.userId, t.status),
  ],
);
