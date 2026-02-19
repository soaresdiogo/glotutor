import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const loginAttempts = pgTable(
  'login_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    email: varchar('email', { length: 255 }).notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    countryCode: varchar('country_code', { length: 5 }),
    status: varchar('status', { length: 30 }).notNull(),
    deviceInfo: varchar('device_info', { length: 500 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('la_email_idx').on(t.email),
    index('la_ip_idx').on(t.ipAddress),
    index('la_created_idx').on(t.createdAt),
  ],
);
