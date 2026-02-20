import { and, eq } from 'drizzle-orm';
import type { PricePlanEntity } from '@/features/subscriptions/domain/entities/price-plan.entity';
import type { IPriceRepository } from '@/features/subscriptions/domain/repositories/price-repository.interface';
import { prices, products } from '@/infrastructure/db/schema';
import type { DbClient } from '@/infrastructure/db/types';

export class PriceRepository implements IPriceRepository {
  constructor(private readonly db: DbClient) {}

  async findActiveRecurringByTenantAndPlanType(
    tenantId: string,
    planType: string,
  ): Promise<PricePlanEntity | null> {
    const row = await this.db
      .select({
        priceId: prices.id,
        productId: prices.productId,
        stripePriceId: prices.stripePriceId,
        currency: prices.currency,
        amountCents: prices.amountCents,
        interval: prices.interval,
        intervalCount: prices.intervalCount,
        type: prices.type,
        productName: products.name,
        planType: products.type,
      })
      .from(prices)
      .innerJoin(products, eq(prices.productId, products.id))
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.type, planType),
          eq(products.isActive, true),
          eq(prices.type, 'recurring'),
          eq(prices.isActive, true),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
    if (!row) return null;
    return {
      priceId: row.priceId,
      productId: row.productId,
      stripePriceId: row.stripePriceId,
      currency: row.currency,
      amountCents: row.amountCents,
      interval: row.interval,
      intervalCount: row.intervalCount,
      type: row.type,
      productName: row.productName,
      planType: row.planType,
    };
  }

  async hasAnyActivePlan(tenantId: string): Promise<boolean> {
    const row = await this.db
      .select({ priceId: prices.id })
      .from(prices)
      .innerJoin(products, eq(prices.productId, products.id))
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.isActive, true),
          eq(prices.type, 'recurring'),
          eq(prices.isActive, true),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
    return row != null;
  }
}
