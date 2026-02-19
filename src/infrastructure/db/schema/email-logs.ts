import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const emailLogs = pgTable(
  'email_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    tenantId: uuid('tenant_id'),
    resendId: varchar('resend_id', { length: 255 }),
    type: varchar('type', { length: 30 }).notNull(),
    toEmail: varchar('to_email', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 500 }),
    status: varchar('status', { length: 20 }).notNull().default('sent'),
    metadata: jsonb('metadata'),
    sentAt: timestamp('sent_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('el_user_idx').on(t.userId),
    index('el_tenant_idx').on(t.tenantId),
    index('el_type_idx').on(t.type),
  ],
);
