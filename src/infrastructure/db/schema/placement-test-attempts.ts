import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

const ATTEMPT_STATUS = ['in_progress', 'completed', 'skipped'] as const;
export type PlacementAttemptStatus = (typeof ATTEMPT_STATUS)[number];

export const placementTestAttempts = pgTable(
  'placement_test_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('in_progress'),
    recommendedLevel: varchar('recommended_level', { length: 5 }),
    selectedLevel: varchar('selected_level', { length: 5 }),
    totalQuestions: integer('total_questions').notNull().default(0),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('pta_user_language_idx').on(t.userId, t.language),
    index('pta_user_status_idx').on(t.userId, t.status),
  ],
);
