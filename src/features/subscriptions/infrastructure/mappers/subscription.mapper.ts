import type { SubscriptionEntity } from '@/features/subscriptions/domain/entities/subscription.entity';
import type { subscriptions } from '@/infrastructure/db/schema/subscriptions';

type SubscriptionRow = typeof subscriptions.$inferSelect;

export const SubscriptionMapper = {
  toDomain(row: SubscriptionRow): SubscriptionEntity {
    return {
      id: row.id,
      userId: row.userId,
      tenantId: row.tenantId,
      priceId: row.priceId,
      stripeSubscriptionId: row.stripeSubscriptionId,
      stripeCustomerId: row.stripeCustomerId,
      status: row.status,
      currentPeriodStart: row.currentPeriodStart,
      currentPeriodEnd: row.currentPeriodEnd,
      trialStart: row.trialStart,
      trialEnd: row.trialEnd,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      canceledAt: row.canceledAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },
};
