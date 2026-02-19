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

export const speakingTopics = pgTable(
  'speaking_topics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 120 }).notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description').notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }).notNull(),
    contextPrompt: text('context_prompt').notNull(),
    richContent: jsonb('rich_content'),
    keyVocabulary: jsonb('key_vocabulary')
      .$type<string[]>()
      .notNull()
      .default([]),
    nativeExpressions: jsonb('native_expressions')
      .$type<string[]>()
      .notNull()
      .default([]),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('st_lang_level_idx').on(t.languageId, t.cefrLevel),
    index('st_slug_lang_idx').on(t.slug, t.languageId),
  ],
);
