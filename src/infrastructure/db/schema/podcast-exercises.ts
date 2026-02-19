import {
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { podcasts } from './podcasts';

export const podcastExercises = pgTable('podcast_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  podcastId: uuid('podcast_id')
    .notNull()
    .references(() => podcasts.id, { onDelete: 'cascade' }),
  questionNumber: integer('question_number').notNull(),
  type: varchar('type', { length: 30 }).notNull(), // multiple_choice | true_false | fill_blank | sentence_order | open_ended
  questionText: text('question_text').notNull(),
  options: jsonb('options').$type<string[] | null>(),
  correctAnswer: text('correct_answer').notNull(),
  explanationText: text('explanation_text').notNull(),
});
