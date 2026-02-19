import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const consentRecords = pgTable(
  'consent_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    consentType: varchar('consent_type', { length: 30 }).notNull(),
    version: varchar('version', { length: 20 }).notNull(),
    granted: boolean('granted').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    grantedAt: timestamp('granted_at'),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('cr_user_idx').on(t.userId),
    index('cr_type_idx').on(t.consentType),
  ],
);
