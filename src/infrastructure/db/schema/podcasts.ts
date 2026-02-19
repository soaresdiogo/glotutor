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
import { supportedLanguages } from './supported-languages';

export const podcasts = pgTable(
  'podcasts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description').notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }).notNull(),
    audioUrl: varchar('audio_url', { length: 1000 }).notNull(),
    transcript: text('transcript').notNull(),
    durationSeconds: integer('duration_seconds').notNull(),
    vocabularyHighlights: jsonb('vocabulary_highlights').$type<
      Array<{ word: string; translation: string }>
    >(),
    richContent: jsonb('rich_content'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('podcasts_lang_level_idx').on(t.languageId, t.cefrLevel)],
);
