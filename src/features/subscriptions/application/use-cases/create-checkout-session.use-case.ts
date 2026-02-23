import type { PricePlanEntity } from '@/features/subscriptions/domain/entities/price-plan.entity';
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

  private async validateConsentAndUpsertPendingSignup(
    dto: CreateCheckoutSessionDto,
    planType: string,
  ): Promise<void> {
    const password = dto.password;
    if (!password || password.length === 0) return;

    if (dto.acceptPrivacy !== true) {
      throw new BadRequestError(
        'You must accept the Privacy Policy to create an account.',
        'subscribe.privacyRequired',
      );
    }
    if (dto.acceptTerms !== true) {
      throw new BadRequestError(
        'You must accept the Terms of Use to create an account.',
        'subscribe.termsRequired',
      );
    }
    const passwordHash = await hashPassword(password);
    const expiresAt = new Date(
      Date.now() + PENDING_SIGNUP_EXPIRY_HOURS * 60 * 60 * 1000,
    );
    const now = new Date();
    await this.pendingSignupRepo.upsert({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      planType,
      expiresAt,
      privacyPolicyAcceptedAt: now,
    });
  }

  private async resolveCustomerId(
    dto: CreateCheckoutSessionDto,
    tenantId: string,
  ): Promise<string> {
    if (!dto.accountId) {
      const customer = await this.stripeService.createCustomer(
        dto.email,
        dto.fullName,
        { tenantId },
      );
      return customer.id;
    }
    const existingSubs = await this.subscriptionRepo.findByUserId(
      dto.accountId,
    );
    const withCustomer = existingSubs.find((s) => s.stripeCustomerId);
    if (withCustomer?.stripeCustomerId) {
      return withCustomer.stripeCustomerId;
    }
    const customer = await this.stripeService.createCustomer(
      dto.email,
      dto.fullName,
      { tenantId },
    );
    return customer.id;
  }

  private async resolvePlan(
    dto: CreateCheckoutSessionDto,
    tenantId: string,
    planType: string | null,
    currency: string | null,
    interval: string | null,
  ): Promise<PricePlanEntity> {
    if (dto.priceId) {
      const plan = await this.priceRepo.findActiveRecurringByTenantAndPriceId(
        tenantId,
        dto.priceId,
      );
      if (!plan) {
        throw new BadRequestError(
          'Invalid or inactive price for this tenant.',
          'subscriptions.planNotFound',
        );
      }
      return plan;
    }
    if (
      planType &&
      currency &&
      (interval === 'month' || interval === 'annual')
    ) {
      const plan =
        await this.priceRepo.findActiveRecurringByTenantPlanTypeCurrencyAndInterval(
          tenantId,
          planType,
          currency,
          interval,
        );
      if (plan) return plan;
    }
    if (planType) {
      const plan = await this.priceRepo.findActiveRecurringByTenantAndPlanType(
        tenantId,
        planType,
      );
      if (plan) return plan;
    }
    const detail =
      planType && currency && interval
        ? `No price found for plan=${planType}, currency=${currency}, interval=${interval}.`
        : `No active subscription plan found for type: ${planType ?? 'unknown'}.`;
    throw new BadRequestError(detail, 'subscriptions.planNotFound');
  }

  private async resolveValidStripePriceId(
    plan: PricePlanEntity,
  ): Promise<string> {
    const stripePriceId = plan.stripePriceId;
    if (!stripePriceId?.startsWith('price_')) {
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
    return stripePriceId;
  }

  async execute(
    dto: CreateCheckoutSessionDto,
    context: { tenantId: string; successUrl: string; cancelUrl: string },
  ): Promise<CreateCheckoutResponseDto> {
    const planType =
      dto.planType != null && dto.planType.length > 0 ? dto.planType : null;
    const currency =
      dto.currency != null && dto.currency.length > 0 ? dto.currency : null;
    const interval = dto.interval ?? null;

    const plan = await this.resolvePlan(
      dto,
      context.tenantId,
      planType,
      currency,
      interval,
    );
    const stripePriceId = await this.resolveValidStripePriceId(plan);

    await this.validateConsentAndUpsertPendingSignup(dto, plan.planType);
    const customerId = await this.resolveCustomerId(dto, context.tenantId);

    const metadata: Record<string, string> = {
      tenantId: context.tenantId,
      email: dto.email,
      fullName: dto.fullName,
      planType: plan.planType,
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
