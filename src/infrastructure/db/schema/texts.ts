import {
  boolean,
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
import { supportedLanguages } from './supported-languages';
import { tenants } from './tenants';

export const texts = pgTable(
  'texts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 500 }).notNull(),
    content: text('content').notNull(),
    structuredContent: jsonb('structured_content'),
    category: varchar('category', { length: 30 }).notNull(),
    level: varchar('level', { length: 5 }).notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }),
    wordCount: integer('word_count'),
    estimatedMinutes: integer('estimated_minutes'),
    difficultyScore: real('difficulty_score'),
    levelMetadata: jsonb('level_metadata'),
    sourceUrl: varchar('source_url', { length: 1000 }),
    generationType: varchar('generation_type', { length: 20 })
      .notNull()
      .default('manual'),
    isPublished: boolean('is_published').notNull().default(false),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('texts_lang_level_idx').on(t.languageId, t.level),
    index('texts_tenant_idx').on(t.tenantId),
    index('texts_category_idx').on(t.category),
    index('texts_published_idx').on(t.isPublished),
  ],
);
