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
import { supportedLanguages } from './supported-languages';
import { tenants } from './tenants';

export const contentGenerationJobs = pgTable(
  'content_generation_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    type: varchar('type', { length: 30 }).notNull(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    level: varchar('level', { length: 5 }),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    inputParams: jsonb('input_params'),
    outputRefs: jsonb('output_refs'),
    itemsGenerated: integer('items_generated').default(0),
    errorLog: text('error_log'),
    scheduledFor: timestamp('scheduled_for'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('cgj_tenant_idx').on(t.tenantId),
    index('cgj_status_idx').on(t.status),
    index('cgj_scheduled_idx').on(t.scheduledFor),
  ],
);
