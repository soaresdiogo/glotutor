import type { SubscriptionEntity } from '@/features/subscriptions/domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '@/features/subscriptions/domain/repositories/subscription-repository.interface';

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export interface IGetMySubscriptionUseCase {
  execute(userId: string): Promise<SubscriptionEntity | null>;
}

export class GetMySubscriptionUseCase implements IGetMySubscriptionUseCase {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionEntity | null> {
    const list = await this.subscriptionRepo.findByUserId(userId);
    const active = list.filter(
      (s) =>
        ACTIVE_STATUSES.has(s.status) ||
        (s.status === 'active' && s.cancelAtPeriodEnd),
    );
    if (active.length === 0) return null;
    active.sort(
      (a, b) =>
        (b.currentPeriodEnd?.getTime() ?? 0) -
        (a.currentPeriodEnd?.getTime() ?? 0),
    );
    return active[0] ?? null;
  }
}
