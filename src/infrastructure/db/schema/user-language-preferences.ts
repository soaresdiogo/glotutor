import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userLanguagePreferences = pgTable(
  'user_language_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    primaryLanguage: varchar('primary_language', { length: 10 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  () => [],
);
