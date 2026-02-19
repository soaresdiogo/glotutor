import {
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { speakingTopics } from './speaking-topics';

export const speakingExercises = pgTable('speaking_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id')
    .notNull()
    .references(() => speakingTopics.id, { onDelete: 'cascade' }),
  questionNumber: integer('question_number').notNull(),
  type: varchar('type', { length: 30 }).notNull(), // fill_blank | multiple_choice | reorder_sentence | match_expression
  questionText: text('question_text').notNull(),
  options: jsonb('options').$type<string[] | Record<string, string>[] | null>(),
  correctAnswer: text('correct_answer').notNull(),
  explanationText: text('explanation_text').notNull(),
});
