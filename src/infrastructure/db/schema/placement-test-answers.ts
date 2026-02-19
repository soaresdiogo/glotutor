import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { placementTestAttempts } from './placement-test-attempts';
import { placementTestQuestions } from './placement-test-questions';

export const placementTestAnswers = pgTable(
  'placement_test_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => placementTestAttempts.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => placementTestQuestions.id, { onDelete: 'cascade' }),
    selectedOptionIndex: integer('selected_option_index').notNull(),
    isCorrect: boolean('is_correct').notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }).notNull(),
    answeredAt: timestamp('answered_at').notNull().defaultNow(),
  },
  (t) => [
    index('ptans_attempt_idx').on(t.attemptId),
    index('ptans_attempt_question_idx').on(t.attemptId, t.questionId),
  ],
);
