import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const mfaSessions = pgTable(
  'mfa_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mfaCodeHash: varchar('mfa_code_hash', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('mfa_sessions_user_idx').on(t.userId),
    index('mfa_sessions_expires_idx').on(t.expiresAt),
  ],
);
