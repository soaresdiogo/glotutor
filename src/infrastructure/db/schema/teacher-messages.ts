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
import { teacherConversations } from './teacher-conversations';

export const teacherMessages = pgTable(
  'teacher_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => teacherConversations.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 10 }).notNull(),
    content: text('content').notNull(),
    corrections: jsonb('corrections'),
    audioUrl: varchar('audio_url', { length: 500 }),
    tokenCount: integer('token_count'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('tm_conv_idx').on(t.conversationId),
    index('tm_conv_created_idx').on(t.conversationId, t.createdAt),
  ],
);
