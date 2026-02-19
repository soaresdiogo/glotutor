import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const userLanguageStreaks = pgTable(
  'user_language_streaks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
    currentStreakDays: integer('current_streak_days').notNull().default(0),
    longestStreakDays: integer('longest_streak_days').notNull().default(0),
    lastActivityAt: timestamp('last_activity_at'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uls_user_lang_unique').on(t.userId, t.language),
    index('uls_user_language_idx').on(t.userId, t.language),
  ],
);
