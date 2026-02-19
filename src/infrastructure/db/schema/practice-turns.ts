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
import { practiceSessions } from './practice-sessions';

export const practiceTurns = pgTable(
  'practice_turns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => practiceSessions.id, { onDelete: 'cascade' }),
    turnIndex: integer('turn_index').notNull(),
    speaker: varchar('speaker', { length: 10 }).notNull(),
    transcript: text('transcript').notNull(),
    audioUrl: varchar('audio_url', { length: 500 }),
    pronunciationScores: jsonb('pronunciation_scores'),
    grammarErrors: jsonb('grammar_errors'),
    suggestions: jsonb('suggestions'),
    turnScore: real('turn_score'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('pt_session_idx').on(t.sessionId),
    index('pt_session_order_idx').on(t.sessionId, t.turnIndex),
  ],
);
