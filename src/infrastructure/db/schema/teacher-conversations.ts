import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { supportedLanguages } from './supported-languages';
import { users } from './users';

export const teacherConversations = pgTable(
  'teacher_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    topic: varchar('topic', { length: 30 }),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    messageCount: integer('message_count').notNull().default(0),
    lastMessageAt: timestamp('last_message_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('tc_user_idx').on(t.userId),
    index('tc_user_status_idx').on(t.userId, t.status),
  ],
);
