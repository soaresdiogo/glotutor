import type { ISubscriptionRepository } from '@/features/subscriptions/domain/repositories/subscription-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import type { IStripeService } from '@/infrastructure/services/stripe/stripe.service';
import { NotFoundError } from '@/shared/lib/errors';

/**
 * Cancels the user's subscription at period end via Stripe and requests account
 * deletion (LGPD/GDPR). User keeps access until current_period_end; then
 * webhook sets deletedAt so they lose login. After grace period, purge job
 * anonymizes PII.
 */
export interface ICancelSubscriptionUseCase {
  execute(userId: string): Promise<{ cancelAtPeriodEnd: boolean }>;
}

export type CancelSubscriptionAuditCallback = (userId: string) => Promise<void>;

export class CancelSubscriptionUseCase implements ICancelSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly stripeService: IStripeService,
    private readonly userRepo: IUserRepository,
    private readonly onDeletionRequested?: CancelSubscriptionAuditCallback,
  ) {}

  async execute(userId: string): Promise<{ cancelAtPeriodEnd: boolean }> {
    const list = await this.subscriptionRepo.findByUserId(userId);
    const active = list.filter(
      (s) =>
        (s.status === 'active' || s.status === 'trialing') &&
        s.stripeSubscriptionId,
    );
    if (active.length === 0) {
      throw new NotFoundError(
        'No active subscription found.',
        'subscriptions.notFound',
      );
    }
    const sub = active[0];
    if (sub.cancelAtPeriodEnd) {
      return { cancelAtPeriodEnd: true };
    }
    const stripeId = sub.stripeSubscriptionId;
    if (!stripeId) {
      throw new NotFoundError(
        'Subscription has no Stripe ID.',
        'subscriptions.notFound',
      );
    }
    await this.stripeService.updateSubscription({
      subscriptionId: stripeId,
      cancelAtPeriodEnd: true,
    });
    await this.subscriptionRepo.update(sub.id, { cancelAtPeriodEnd: true });

    await this.userRepo.setDeletionRequestedAt(userId, new Date());
    await this.onDeletionRequested?.(userId);

    return { cancelAtPeriodEnd: true };
  }
}
