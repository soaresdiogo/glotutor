import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const QUESTION_TYPE = [
  'reading_comprehension',
  'vocabulary',
  'listening',
] as const;
export type PlacementQuestionType = (typeof QUESTION_TYPE)[number];

export const QUESTION_POOL = ['placement', 'certification'] as const;
export type QuestionPool = (typeof QUESTION_POOL)[number];

export const placementTestQuestions = pgTable(
  'placement_test_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    language: varchar('language', { length: 10 }).notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }).notNull(),
    questionType: varchar('question_type', { length: 30 }).notNull(),
    questionText: text('question_text').notNull(),
    audioUrl: text('audio_url'),
    options: jsonb('options').$type<string[]>().notNull(),
    correctOptionIndex: integer('correct_option_index').notNull(),
    questionPool: varchar('question_pool', { length: 20 })
      .notNull()
      .default('placement'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('ptq_language_level_idx').on(t.language, t.cefrLevel),
    index('ptq_language_level_type_idx').on(
      t.language,
      t.cefrLevel,
      t.questionType,
    ),
    index('ptq_pool_lang_level_idx').on(
      t.questionPool,
      t.language,
      t.cefrLevel,
    ),
  ],
);
