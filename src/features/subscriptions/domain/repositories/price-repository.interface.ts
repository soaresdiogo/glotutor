import type { PricePlanEntity } from '../entities/price-plan.entity';

export type PriceOptionEntity = Pick<
  PricePlanEntity,
  'priceId' | 'currency' | 'amountCents' | 'interval' | 'intervalCount'
> & { stripePriceId: string | null };

export type PlanWithPricesEntity = {
  planType: string;
  productName: string;
  productId: string;
  prices: PriceOptionEntity[];
};

export interface IPriceRepository {
  findActiveRecurringByTenantAndPlanType(
    tenantId: string,
    planType: string,
  ): Promise<PricePlanEntity | null>;
  /** Resolve a single price by ID; ensures it belongs to tenant and is active recurring. */
  findActiveRecurringByTenantAndPriceId(
    tenantId: string,
    priceId: string,
  ): Promise<PricePlanEntity | null>;
  /**
   * Resolve price by plan + currency + interval for URL-driven checkout.
   * interval: 'month' = monthly, 'annual' = yearly (matches interval=year or interval=month+intervalCount=12).
   */
  findActiveRecurringByTenantPlanTypeCurrencyAndInterval(
    tenantId: string,
    planType: string,
    currency: string,
    interval: 'month' | 'annual',
  ): Promise<PricePlanEntity | null>;
  /** List all active recurring prices for a plan type (for multi-currency / multi-interval). */
  findActiveRecurringPricesByTenantAndPlanType(
    tenantId: string,
    planType: string,
  ): Promise<PriceOptionEntity[]>;
  /** List all plans with their price options (for subscription page). */
  findPlansWithPricesByTenant(
    tenantId: string,
  ): Promise<PlanWithPricesEntity[]>;
  hasAnyActivePlan(tenantId: string): Promise<boolean>;
}
