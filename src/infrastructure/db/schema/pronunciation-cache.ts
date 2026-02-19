import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const pronunciationCache = pgTable(
  'pronunciation_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    word: varchar('word', { length: 100 }).notNull(),
    languageCode: varchar('language_code', { length: 10 }).notNull(),
    audioUrl: varchar('audio_url', { length: 500 }).notNull(),
    phoneticIpa: varchar('phonetic_ipa', { length: 200 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('pc_word_lang_unique').on(t.word, t.languageCode)],
);
