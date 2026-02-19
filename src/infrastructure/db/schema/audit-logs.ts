import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    tenantId: uuid('tenant_id'),
    action: varchar('action', { length: 50 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: varchar('entity_id', { length: 100 }),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('audit_logs_user_idx').on(t.userId),
    index('audit_logs_tenant_idx').on(t.tenantId),
    index('audit_logs_action_idx').on(t.action),
    index('audit_logs_created_idx').on(t.createdAt),
  ],
);
