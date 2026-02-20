import type { IPendingSignupRepository } from '@/features/subscriptions/domain/repositories/pending-signup-repository.interface';
import type { IPriceRepository } from '@/features/subscriptions/domain/repositories/price-repository.interface';
import type { ISubscriptionRepository } from '@/features/subscriptions/domain/repositories/subscription-repository.interface';
import type { IStripeService } from '@/infrastructure/services/stripe/stripe.service';
import { hashPassword } from '@/shared/lib/auth/password';
import { BadRequestError } from '@/shared/lib/errors';
import type { CreateCheckoutResponseDto } from '../../infrastructure/presenters/create-checkout.presenter';
import type { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';

const TRIAL_PERIOD_DAYS = 7;
const PENDING_SIGNUP_EXPIRY_HOURS = 1;

export interface ICreateCheckoutSessionUseCase {
  execute(
    dto: CreateCheckoutSessionDto,
    context: { tenantId: string; successUrl: string; cancelUrl: string },
  ): Promise<CreateCheckoutResponseDto>;
}

export class CreateCheckoutSessionUseCase
  implements ICreateCheckoutSessionUseCase
{
  constructor(
    private readonly priceRepo: IPriceRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly pendingSignupRepo: IPendingSignupRepository,
    private readonly stripeService: IStripeService,
  ) {}

  async execute(
    dto: CreateCheckoutSessionDto,
    context: { tenantId: string; successUrl: string; cancelUrl: string },
  ): Promise<CreateCheckoutResponseDto> {
    const plan = await this.priceRepo.findActiveRecurringByTenantAndPlanType(
      context.tenantId,
      dto.planType,
    );
    if (!plan) {
      throw new BadRequestError(
        `No active subscription plan found for type: ${dto.planType}`,
        'subscriptions.planNotFound',
      );
    }
    const stripePriceId = plan.stripePriceId;
    if (!stripePriceId || !stripePriceId.startsWith('price_')) {
      throw new BadRequestError(
        'Plan is missing a valid Stripe Price ID',
        'subscriptions.invalidPrice',
      );
    }
    const stripePrice = await this.stripeService.getPrice(stripePriceId);
    if (stripePrice.type !== 'recurring') {
      throw new BadRequestError(
        'Subscription plans must use a recurring price',
        'subscriptions.nonRecurringPrice',
      );
    }

    if (dto.password != null && dto.password.length > 0) {
      const passwordHash = await hashPassword(dto.password);
      const expiresAt = new Date(
        Date.now() + PENDING_SIGNUP_EXPIRY_HOURS * 60 * 60 * 1000,
      );
      await this.pendingSignupRepo.upsert({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        planType: dto.planType,
        expiresAt,
      });
    }

    let customerId: string;
    if (dto.accountId) {
      const existingSubs = await this.subscriptionRepo.findByUserId(
        dto.accountId,
      );
      const withCustomer = existingSubs.find((s) => s.stripeCustomerId);
      if (withCustomer?.stripeCustomerId) {
        customerId = withCustomer.stripeCustomerId;
      } else {
        const customer = await this.stripeService.createCustomer(
          dto.email,
          dto.fullName,
          { tenantId: context.tenantId },
        );
        customerId = customer.id;
      }
    } else {
      const customer = await this.stripeService.createCustomer(
        dto.email,
        dto.fullName,
        { tenantId: context.tenantId },
      );
      customerId = customer.id;
    }

    const metadata: Record<string, string> = {
      tenantId: context.tenantId,
      email: dto.email,
      fullName: dto.fullName,
      planType: dto.planType,
      planId: plan.priceId,
      priceId: plan.priceId,
    };
    if (dto.accountId) metadata.accountId = dto.accountId;

    const { sessionId, url } = await this.stripeService.createCheckoutSession({
      customerId,
      priceId: stripePriceId,
      successUrl: context.successUrl,
      cancelUrl: context.cancelUrl,
      metadata,
      subscriptionMetadata: metadata,
      trialPeriodDays: TRIAL_PERIOD_DAYS,
    });

    return {
      checkoutSessionId: sessionId,
      checkoutUrl: url,
      customerId,
      plan: {
        planType: plan.planType,
        priceId: plan.priceId,
        productName: plan.productName,
        currency: plan.currency,
        amountCents: plan.amountCents,
        interval: plan.interval,
      },
    };
  }
}
