import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { placementTestAttempts } from './placement-test-attempts';
import { users } from './users';

export const userLanguageProgress = pgTable(
  'user_language_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
    currentLevel: varchar('current_level', { length: 5 }).notNull(),
    placementTestId: uuid('placement_test_id').references(
      () => placementTestAttempts.id,
      { onDelete: 'set null' },
    ),
    isActive: boolean('is_active').notNull().default(true),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('ulp_user_language_idx').on(t.userId, t.language),
    index('ulp_user_active_idx').on(t.userId, t.isActive),
  ],
);
