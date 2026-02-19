import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { supportedLanguages } from './supported-languages';
import { tenants } from './tenants';
import { texts } from './texts';

export const audioLessons = pgTable(
  'audio_lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 500 }).notNull(),
    transcript: text('transcript').notNull(),
    audioUrl: varchar('audio_url', { length: 500 }).notNull(),
    category: varchar('category', { length: 30 }).notNull(),
    level: varchar('level', { length: 5 }).notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }),
    durationSeconds: integer('duration_seconds'),
    speechRateWpm: real('speech_rate_wpm'),
    generationType: varchar('generation_type', { length: 20 })
      .notNull()
      .default('manual'),
    sourceTextId: uuid('source_text_id').references(() => texts.id, {
      onDelete: 'set null',
    }),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('audio_lessons_lang_level_idx').on(t.languageId, t.level),
    index('audio_lessons_tenant_idx').on(t.tenantId),
    index('audio_lessons_category_idx').on(t.category),
  ],
);
