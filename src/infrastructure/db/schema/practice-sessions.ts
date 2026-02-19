import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { supportedLanguages } from './supported-languages';
import { users } from './users';

export const practiceSessions = pgTable(
  'practice_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: varchar('mode', { length: 30 }).notNull(),
    scenario: varchar('scenario', { length: 100 }),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    level: varchar('level', { length: 5 }),
    targetDurationSeconds: integer('target_duration_seconds'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    actualDurationSeconds: integer('actual_duration_seconds'),
    overallScore: real('overall_score'),
    scoresBreakdown: jsonb('scores_breakdown'),
    aiFeedback: text('ai_feedback'),
    turnCount: integer('turn_count').notNull().default(0),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('ps_user_idx').on(t.userId),
    index('ps_user_mode_idx').on(t.userId, t.mode),
  ],
);
