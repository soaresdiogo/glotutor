import { randomBytes } from 'node:crypto';
import type Stripe from 'stripe';
import type { IPendingSignupRepository } from '@/features/subscriptions/domain/repositories/pending-signup-repository.interface';
import type { ISubscriptionRepository } from '@/features/subscriptions/domain/repositories/subscription-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import type { IStripeService } from '@/infrastructure/services/stripe/stripe.service';
import { hashPassword } from '@/shared/lib/auth/password';
import { BadRequestError } from '@/shared/lib/errors';
import type { CompleteRegistrationDto } from '../dto/complete-registration.dto';

/** Shape we need from Stripe Checkout.Session (expanded subscription). */
type StripeSubscriptionShape = {
  id: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  trial_start?: number;
  trial_end?: number;
  cancel_at_period_end?: boolean;
  canceled_at?: number;
};

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return stripeStatus;
  }
}

type SessionContext = {
  email: string;
  fullName: string | null;
  tenantId: string | null;
  priceId: string | null;
  planId: string | null;
  accountId: string | null;
  stripeSubscription: StripeSubscriptionShape | null;
  customerId: string | null;
};

export type CompleteRegistrationResult = {
  userId: string;
  email: string;
  subscriptionLinked: boolean;
};

export interface ICompleteRegistrationUseCase {
  execute(dto: CompleteRegistrationDto): Promise<CompleteRegistrationResult>;
}

export class CompleteRegistrationUseCase
  implements ICompleteRegistrationUseCase
{
  constructor(
    private readonly stripeService: IStripeService,
    private readonly userRepo: IUserRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly pendingSignupRepo: IPendingSignupRepository,
  ) {}

  async execute(
    dto: CompleteRegistrationDto,
  ): Promise<CompleteRegistrationResult> {
    const session = await this.stripeService.getCheckoutSession(dto.sessionId, [
      'subscription',
      'customer',
    ]);
    const ctx = this.parseSessionContext(session, dto);

    const { user, accountId } = await this.resolveOrCreateUser(ctx);
    const subscriptionLinked = await this.linkSubscriptionIfNeeded(
      ctx,
      accountId,
    );

    return {
      userId: user.userId,
      email: user.email,
      subscriptionLinked,
    };
  }

  private parseSessionContext(
    session: Stripe.Checkout.Session,
    dto: CompleteRegistrationDto,
  ): SessionContext {
    if (session.mode !== 'subscription') {
      throw new BadRequestError(
        'Session is not a subscription checkout',
        'subscriptions.invalidSession',
      );
    }
    const metadata = (session.metadata as Record<string, string>) ?? {};
    const email = (dto.email ?? metadata.email ?? session.customer_email ?? '')
      .trim()
      .toLowerCase();
    if (!email) {
      throw new BadRequestError(
        'Email is required to complete registration',
        'subscriptions.emailRequired',
      );
    }
    const stripeSubscription: StripeSubscriptionShape | null =
      typeof session.subscription === 'object' && session.subscription
        ? (session.subscription as StripeSubscriptionShape)
        : null;
    const customerId =
      typeof session.customer === 'object' && session.customer
        ? session.customer.id
        : ((session.customer as string) ?? null);

    return {
      email,
      fullName: metadata.fullName ?? null,
      tenantId: metadata.tenantId ?? null,
      priceId: metadata.priceId ?? null,
      planId: metadata.planId ?? metadata.priceId ?? null,
      accountId: metadata.accountId ?? null,
      stripeSubscription,
      customerId,
    };
  }

  private async resolveOrCreateUser(ctx: SessionContext): Promise<{
    user: Awaited<ReturnType<IUserRepository['findByEmail']>> & {
      userId: string;
      email: string;
    };
    accountId: string;
  }> {
    const existing = await this.userRepo.findByEmail(ctx.email);
    if (existing) {
      return {
        user: existing,
        accountId: existing.userId,
      };
    }

    const pending = await this.pendingSignupRepo.findValidByEmail(ctx.email);
    const passwordHash = pending
      ? await this.consumePendingSignupPassword(ctx.email, pending.passwordHash)
      : await this.generateRandomPasswordHash();

    const created = await this.userRepo.create({
      email: ctx.email,
      passwordHash,
      name: ctx.fullName,
      tenantId: ctx.tenantId,
    });
    await this.userRepo.updateEmailVerified(created.userId, true);
    await this.userRepo.updateStatus(created.userId, 'active');

    return { user: created, accountId: created.userId };
  }

  private async consumePendingSignupPassword(
    email: string,
    passwordHash: string,
  ): Promise<string> {
    await this.pendingSignupRepo.deleteByEmail(email);
    return passwordHash;
  }

  private async generateRandomPasswordHash(): Promise<string> {
    const randomPassword = randomBytes(32).toString('hex');
    return hashPassword(randomPassword);
  }

  private async linkSubscriptionIfNeeded(
    ctx: SessionContext,
    accountId: string,
  ): Promise<boolean> {
    if (!ctx.stripeSubscription || !ctx.priceId) return false;

    const existing = await this.subscriptionRepo.findByStripeSubscriptionId(
      ctx.stripeSubscription.id,
    );
    if (existing) return true;

    const status = mapStripeStatus(ctx.stripeSubscription.status);
    await this.subscriptionRepo.create({
      userId: accountId,
      tenantId: ctx.tenantId,
      priceId: ctx.priceId,
      stripeSubscriptionId: ctx.stripeSubscription.id,
      stripeCustomerId: ctx.customerId,
      status,
      currentPeriodStart: ctx.stripeSubscription.current_period_start
        ? new Date(ctx.stripeSubscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: ctx.stripeSubscription.current_period_end
        ? new Date(ctx.stripeSubscription.current_period_end * 1000)
        : null,
      trialStart: ctx.stripeSubscription.trial_start
        ? new Date(ctx.stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: ctx.stripeSubscription.trial_end
        ? new Date(ctx.stripeSubscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: ctx.stripeSubscription.cancel_at_period_end ?? false,
      canceledAt: ctx.stripeSubscription.canceled_at
        ? new Date(ctx.stripeSubscription.canceled_at * 1000)
        : null,
    });
    return true;
  }
}
