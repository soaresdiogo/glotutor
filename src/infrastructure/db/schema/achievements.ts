import { jsonb, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 500 }),
  category: varchar('category', { length: 30 }).notNull(),
  criteria: jsonb('criteria'),
});
