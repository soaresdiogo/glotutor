import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const levelProgress = pgTable(
  'level_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
    cefrLevel: varchar('cefr_level', { length: 5 }).notNull(),
    lessonsTotal: integer('lessons_total').notNull().default(0),
    lessonsCompleted: integer('lessons_completed').notNull().default(0),
    podcastsTotal: integer('podcasts_total').notNull().default(0),
    podcastsCompleted: integer('podcasts_completed').notNull().default(0),
    readingsTotal: integer('readings_total').notNull().default(0),
    readingsCompleted: integer('readings_completed').notNull().default(0),
    conversationsTotal: integer('conversations_total').notNull().default(0),
    conversationsCompleted: integer('conversations_completed')
      .notNull()
      .default(0),
    completionPercentage: numeric('completion_percentage', {
      precision: 5,
      scale: 2,
    }).default('0'),
    certificationUnlocked: boolean('certification_unlocked')
      .notNull()
      .default(false),
    certifiedAt: timestamp('certified_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('lp_user_lang_level_idx').on(t.userId, t.language, t.cefrLevel),
  ],
);
