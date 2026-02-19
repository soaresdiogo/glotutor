import {
  boolean,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { supportedLanguages } from './supported-languages';
import { tenants } from './tenants';

export const interviewTemplates = pgTable(
  'interview_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    industry: varchar('industry', { length: 50 }).notNull(),
    level: varchar('level', { length: 20 }).notNull(),
    questions: jsonb('questions').notNull(),
    evaluationCriteria: jsonb('evaluation_criteria'),
    isPublished: boolean('is_published').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('it_lang_idx').on(t.languageId),
    index('it_tenant_idx').on(t.tenantId),
    index('it_industry_idx').on(t.industry, t.level),
  ],
);
