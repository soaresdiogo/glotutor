import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { products } from './products';

export const prices = pgTable(
  'prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    stripePriceId: varchar('stripe_price_id', { length: 255 }).unique(),
    currency: varchar('currency', { length: 5 }).notNull().default('usd'),
    amountCents: integer('amount_cents').notNull(),
    interval: varchar('interval', { length: 10 }).notNull().default('month'),
    intervalCount: integer('interval_count').notNull().default(1),
    type: varchar('type', { length: 15 }).notNull().default('recurring'),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('prices_product_idx').on(t.productId),
    index('prices_stripe_idx').on(t.stripePriceId),
  ],
);
