import {
  doublePrecision,
  integer,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { speakingSessions } from './speaking-sessions';
import { users } from './users';

export const speakingSessionUsage = pgTable('speaking_session_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => speakingSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalTurns: integer('total_turns').notNull(),
  totalInputTokens: integer('total_input_tokens').notNull(),
  totalOutputTokens: integer('total_output_tokens').notNull(),
  estimatedCostUsd: doublePrecision('estimated_cost_usd').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
