import {
  date,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const userLanguageStudyTime = pgTable(
  'user_language_study_time',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
    date: date('date').notNull(),
    minutesStudied: integer('minutes_studied').notNull().default(0),
    activitiesCompleted: integer('activities_completed').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('ulst_user_lang_date_unique').on(t.userId, t.language, t.date),
    index('ulst_user_lang_date_idx').on(t.userId, t.language, t.date),
  ],
);
