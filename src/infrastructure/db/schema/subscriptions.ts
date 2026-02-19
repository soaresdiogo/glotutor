import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { prices } from './prices';
import { tenants } from './tenants';
import { users } from './users';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'set null',
    }),
    priceId: uuid('price_id')
      .notNull()
      .references(() => prices.id),
    stripeSubscriptionId: varchar('stripe_subscription_id', {
      length: 255,
    }).unique(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    status: varchar('status', { length: 20 }).notNull().default('incomplete'),
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    canceledAt: timestamp('canceled_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('subs_user_idx').on(t.userId),
    index('subs_tenant_idx').on(t.tenantId),
    index('subs_stripe_idx').on(t.stripeSubscriptionId),
    index('subs_status_idx').on(t.status),
  ],
);
