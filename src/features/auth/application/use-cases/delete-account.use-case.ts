import type { ISubscriptionRepository } from '@/features/subscriptions/domain/repositories/subscription-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import type { IStripeService } from '@/infrastructure/services/stripe/stripe.service';

/**
 * Soft-deletes the user and cancels any active Stripe subscription immediately
 * so the user is not charged again. The subscription is canceled in Stripe
 * (no renewal), then the user record is marked deleted.
 */
export interface IDeleteAccountUseCase {
  execute(userId: string): Promise<void>;
}

export class DeleteAccountUseCase implements IDeleteAccountUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly stripeService: IStripeService,
  ) {}

  async execute(userId: string): Promise<void> {
    const subs = await this.subscriptionRepo.findByUserId(userId);
    const toCancel = subs.filter(
      (s) =>
        (s.status === 'active' || s.status === 'trialing') &&
        s.stripeSubscriptionId,
    );
    for (const sub of toCancel) {
      const stripeId = sub.stripeSubscriptionId;
      if (stripeId) {
        try {
          await this.stripeService.cancelSubscription(stripeId);
        } catch {
          // Best effort: still soft-delete user even if Stripe fails
        }
      }
      await this.subscriptionRepo.update(sub.id, {
        status: 'canceled',
        canceledAt: new Date(),
      });
    }
    await this.userRepo.setDeletedAt(userId, new Date());
  }
}
