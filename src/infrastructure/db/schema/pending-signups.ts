import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

const PENDING_SIGNUP_EXPIRY_HOURS = 1;

export const pendingSignups = pgTable(
  'pending_signups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }),
    planType: varchar('plan_type', { length: 30 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    /** When the user accepted the privacy policy (mandatory for signup). */
    privacyPolicyAcceptedAt: timestamp('privacy_policy_accepted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('pending_signups_email_idx').on(t.email),
    index('pending_signups_expires_idx').on(t.expiresAt),
  ],
);

export { PENDING_SIGNUP_EXPIRY_HOURS };
