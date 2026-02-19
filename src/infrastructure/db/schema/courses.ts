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
import { tenants } from './tenants';

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    level: varchar('level', { length: 5 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    totalLessons: integer('total_lessons').default(0),
    estimatedHours: integer('estimated_hours'),
    coverImageUrl: varchar('cover_image_url', { length: 500 }),
    metadata: jsonb('metadata'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('courses_lang_idx').on(t.languageId),
    index('courses_tenant_idx').on(t.tenantId),
    index('courses_level_idx').on(t.level),
    index('courses_sort_idx').on(t.sortOrder),
  ],
);
