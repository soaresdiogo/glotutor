import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const dataRequests = pgTable(
  'data_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    requestType: varchar('request_type', { length: 30 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    notes: text('notes'),
    processedBy: varchar('processed_by', { length: 100 }),
    resultUrl: text('result_url'),
    requestedAt: timestamp('requested_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('dr_user_idx').on(t.userId),
    index('dr_status_idx').on(t.status),
  ],
);
