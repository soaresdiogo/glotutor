import {
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { supportedLanguages } from './supported-languages';
import { users } from './users';

export const userVocabulary = pgTable(
  'user_vocabulary',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    word: varchar('word', { length: 100 }).notNull(),
    definition: text('definition'),
    contextSentence: text('context_sentence'),
    timesEncountered: integer('times_encountered').notNull().default(1),
    timesCorrect: integer('times_correct').notNull().default(0),
    timesIncorrect: integer('times_incorrect').notNull().default(0),
    mastery: real('mastery').notNull().default(0),
    srsLevel: varchar('srs_level', { length: 20 }).notNull().default('new'),
    nextReviewAt: timestamp('next_review_at'),
    lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uv_user_word_lang_unique').on(t.userId, t.word, t.languageId),
    index('uv_user_srs_idx').on(t.userId, t.srsLevel),
    index('uv_next_review_idx').on(t.userId, t.nextReviewAt),
  ],
);
