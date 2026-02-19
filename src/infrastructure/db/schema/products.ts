import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    stripeProductId: varchar('stripe_product_id', { length: 255 }).unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 30 }).notNull().default('individual'),
    isActive: boolean('is_active').notNull().default(true),
    features: jsonb('features'),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('products_tenant_idx').on(t.tenantId),
    index('products_stripe_idx').on(t.stripeProductId),
  ],
);
