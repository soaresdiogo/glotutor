import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { subscriptions } from './subscriptions';
import { users } from './users';

export const paymentHistory = pgTable(
  'payment_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, {
      onDelete: 'set null',
    }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }).unique(),
    stripeChargeId: varchar('stripe_charge_id', { length: 255 }),
    amountCents: integer('amount_cents').notNull(),
    currency: varchar('currency', { length: 5 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 20 }),
    receiptUrl: text('receipt_url'),
    invoicePdfUrl: text('invoice_pdf_url'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('ph_user_idx').on(t.userId),
    index('ph_sub_idx').on(t.subscriptionId),
    index('ph_stripe_inv_idx').on(t.stripeInvoiceId),
  ],
);
