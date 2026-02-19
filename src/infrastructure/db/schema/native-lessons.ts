import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const nativeLessons = pgTable(
  'native_lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    language: varchar('language', { length: 10 }).notNull(),
    level: varchar('level', { length: 5 }).notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    content: jsonb('content'),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('native_lessons_language_level_order_idx').on(
      t.language,
      t.level,
      t.sortOrder,
    ),
  ],
);
