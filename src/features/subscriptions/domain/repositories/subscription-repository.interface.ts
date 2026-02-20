import type { SubscriptionEntity } from '../entities/subscription.entity';

export type CreateSubscriptionInput = {
  userId: string;
  tenantId: string | null;
  priceId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string | null;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
};

export type UpdateSubscriptionInput = Partial<{
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
}>;

export interface ISubscriptionRepository {
  create(data: CreateSubscriptionInput): Promise<SubscriptionEntity>;
  findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null>;
  findByUserId(userId: string): Promise<SubscriptionEntity[]>;
  update(
    id: string,
    data: UpdateSubscriptionInput,
  ): Promise<SubscriptionEntity>;
}
