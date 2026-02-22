import type { PricePlanEntity } from '../entities/price-plan.entity';

export interface IPriceRepository {
  findActiveRecurringByTenantAndPlanType(
    tenantId: string,
    planType: string,
  ): Promise<PricePlanEntity | null>;
  hasAnyActivePlan(tenantId: string): Promise<boolean>;
}
