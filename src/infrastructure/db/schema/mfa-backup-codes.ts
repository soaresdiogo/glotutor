import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const mfaBackupCodes = pgTable(
  'mfa_backup_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    codeHash: varchar('code_hash', { length: 255 }).notNull(),
    used: boolean('used').notNull().default(false),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('mfa_bc_user_idx').on(t.userId)],
);
