import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'set null',
    }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    role: varchar('role', { length: 20 }).notNull().default('student'),
    emailVerified: boolean('email_verified').notNull().default(false),
    mfaEnabled: boolean('mfa_enabled').notNull().default(true),
    mfaSecret: varchar('mfa_secret', { length: 500 }),
    locale: varchar('locale', { length: 10 }).default('en-US'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    lastLoginAt: timestamp('last_login_at'),
    /** When set, user requested account deletion (e.g. after canceling subscription). Access until subscription period ends, then deletedAt is set. */
    deletionRequestedAt: timestamp('deletion_requested_at'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('users_email_idx').on(t.email),
    index('users_tenant_idx').on(t.tenantId),
    index('users_status_idx').on(t.status),
  ],
);
