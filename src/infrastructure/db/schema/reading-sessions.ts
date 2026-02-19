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

import { texts } from './texts';
import { users } from './users';

export const readingSessions = pgTable(
  'reading_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    textId: uuid('text_id')
      .notNull()
      .references(() => texts.id),
    wordsPerMinute: integer('words_per_minute'),
    accuracy: real('accuracy'),
    durationSeconds: integer('duration_seconds'),
    wordsRead: integer('words_read'),
    greenCount: integer('green_count').notNull().default(0),
    yellowCount: integer('yellow_count').notNull().default(0),
    redCount: integer('red_count').notNull().default(0),
    missedCount: integer('missed_count').notNull().default(0),
    wordScores: jsonb('word_scores'),
    aiFeedback: text('ai_feedback'),
    feedback: jsonb('feedback'),
    grammarItems: jsonb('grammar_items'),
    azurePronunciationScore: real('azure_pronunciation_score'),
    azureAccuracyScore: real('azure_accuracy_score'),
    azureFluencyScore: real('azure_fluency_score'),
    azureCompletenessScore: real('azure_completeness_score'),
    status: varchar('status', { length: 20 }).notNull().default('in_progress'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    /** Comprehension answers: { [questionKey]: { answer: string, correct: boolean } } */
    comprehensionAnswers: jsonb('comprehension_answers').$type<Record<
      string,
      { answer: string; correct: boolean }
    > | null>(),
  },
  (t) => [
    index('rs_user_idx').on(t.userId),
    index('rs_text_idx').on(t.textId),
    index('rs_user_created_idx').on(t.userId, t.createdAt),
  ],
);
