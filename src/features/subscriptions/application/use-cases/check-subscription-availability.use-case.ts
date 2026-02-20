import type { IPriceRepository } from '@/features/subscriptions/domain/repositories/price-repository.interface';

export type CheckAvailabilityResult = {
  available: boolean;
  planFound: boolean;
};

export interface ICheckSubscriptionAvailabilityUseCase {
  execute(
    tenantId: string,
    planType?: string | null,
  ): Promise<CheckAvailabilityResult>;
}

export class CheckSubscriptionAvailabilityUseCase
  implements ICheckSubscriptionAvailabilityUseCase
{
  constructor(private readonly priceRepo: IPriceRepository) {}

  async execute(
    tenantId: string,
    planType?: string | null,
  ): Promise<CheckAvailabilityResult> {
    const hasAnyPlan = await this.priceRepo.hasAnyActivePlan(tenantId);
    if (!hasAnyPlan) {
      return { available: false, planFound: false };
    }
    if (planType == null || planType === '') {
      return { available: true, planFound: true };
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
