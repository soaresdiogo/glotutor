import { boolean, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const supportedLanguages = pgTable('supported_languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  nativeName: varchar('native_name', { length: 100 }),
  flagEmoji: varchar('flag_emoji', { length: 10 }),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
});
