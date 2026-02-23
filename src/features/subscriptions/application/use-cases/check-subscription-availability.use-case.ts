import type { IPriceRepository } from '@/features/subscriptions/domain/repositories/price-repository.interface';

export type CheckAvailabilityResult = {
  available: boolean;
  planFound: boolean;
};

export type CheckAvailabilityParams = {
  planType?: string | null;
  currency?: string | null;
  interval?: 'month' | 'annual' | null;
};

export interface ICheckSubscriptionAvailabilityUseCase {
  execute(
    tenantId: string,
    params?: CheckAvailabilityParams | null,
  ): Promise<CheckAvailabilityResult>;
}

export class CheckSubscriptionAvailabilityUseCase
  implements ICheckSubscriptionAvailabilityUseCase
{
  constructor(private readonly priceRepo: IPriceRepository) {}

  async execute(
    tenantId: string,
    params?: CheckAvailabilityParams | null,
  ): Promise<CheckAvailabilityResult> {
    const planType = params?.planType;
    const currency = params?.currency;
    const interval = params?.interval;

    const hasAnyPlan = await this.priceRepo.hasAnyActivePlan(tenantId);
    if (!hasAnyPlan) {
      return { available: false, planFound: false };
    }
    if (planType == null || planType === '') {
      return { available: true, planFound: true };
    }

    if (
      currency != null &&
      currency.length > 0 &&
      (interval === 'month' || interval === 'annual')
    ) {
      const plan =
        await this.priceRepo.findActiveRecurringByTenantPlanTypeCurrencyAndInterval(
          tenantId,
          planType,
          currency,
          interval,
        );
      return { available: true, planFound: plan != null };
    }

    const plan = await this.priceRepo.findActiveRecurringByTenantAndPlanType(
      tenantId,
      planType,
    );
    return {
      available: true,
      planFound: plan != null,
    };
  }
}
