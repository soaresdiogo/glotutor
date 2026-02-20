import { eq } from 'drizzle-orm';
import type { SubscriptionEntity } from '@/features/subscriptions/domain/entities/subscription.entity';
import type {
  CreateSubscriptionInput,
  ISubscriptionRepository,
  UpdateSubscriptionInput,
} from '@/features/subscriptions/domain/repositories/subscription-repository.interface';
import { SubscriptionMapper } from '@/features/subscriptions/infrastructure/mappers/subscription.mapper';
import { subscriptions } from '@/infrastructure/db/schema/subscriptions';
import type { DbClient } from '@/infrastructure/db/types';

export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    const [row] = await this.db
      .insert(subscriptions)
      .values({
        userId: data.userId,
        tenantId: data.tenantId,
        priceId: data.priceId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        trialStart: data.trialStart,
        trialEnd: data.trialEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
        canceledAt: data.canceledAt ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create subscription');
    return SubscriptionMapper.toDomain(row);
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    const row = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
    });
    return row ? SubscriptionMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<SubscriptionEntity[]> {
    const rows = await this.db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
    });
    return rows.map(SubscriptionMapper.toDomain);
  }

  async update(
    id: string,
    data: UpdateSubscriptionInput,
  ): Promise<SubscriptionEntity> {
    const [row] = await this.db
      .update(subscriptions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning();
    if (!row) throw new Error('Subscription not found');
    return SubscriptionMapper.toDomain(row);
  }
}
