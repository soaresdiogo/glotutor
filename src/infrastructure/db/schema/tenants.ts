import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }),
    logoUrl: text('logo_url'),
    theme: jsonb('theme'),
    settings: jsonb('settings'),
    status: varchar('status', { length: 20 }).notNull().default('trial'),
    plan: varchar('plan', { length: 30 }).notNull().default('starter'),
    ownerUserId: uuid('owner_user_id'),
    trialEndsAt: timestamp('trial_ends_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('tenants_slug_idx').on(t.slug),
    index('tenants_domain_idx').on(t.domain),
  ],
);
