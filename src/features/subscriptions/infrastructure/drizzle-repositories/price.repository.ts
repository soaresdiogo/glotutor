import { and, asc, eq, or } from 'drizzle-orm';
import type { PricePlanEntity } from '@/features/subscriptions/domain/entities/price-plan.entity';
import type {
  IPriceRepository,
  PlanWithPricesEntity,
  PriceOptionEntity,
} from '@/features/subscriptions/domain/repositories/price-repository.interface';
import { prices, products } from '@/infrastructure/db/schema';
import type { DbClient } from '@/infrastructure/db/types';

function rowToPricePlan(row: {
  priceId: string;
  productId: string;
  stripePriceId: string | null;
  currency: string;
  amountCents: number;
  interval: string;
  intervalCount: number;
  type: string;
  productName: string;
  planType: string;
}): PricePlanEntity {
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
      .orderBy(
        asc(prices.currency),
        asc(prices.interval),
        asc(prices.amountCents),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
    if (!row) return null;
    return rowToPricePlan(row);
  }

  async findActiveRecurringByTenantAndPriceId(
    tenantId: string,
    priceId: string,
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
          eq(prices.id, priceId),
          eq(products.tenantId, tenantId),
          eq(products.isActive, true),
          eq(prices.type, 'recurring'),
          eq(prices.isActive, true),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
    if (!row) return null;
    return rowToPricePlan(row);
  }

  async findActiveRecurringByTenantPlanTypeCurrencyAndInterval(
    tenantId: string,
    planType: string,
    currency: string,
    interval: 'month' | 'annual',
  ): Promise<PricePlanEntity | null> {
    const currencyNorm = currency.trim().toUpperCase();
    const intervalCondition =
      interval === 'month'
        ? and(eq(prices.interval, 'month'), eq(prices.intervalCount, 1))
        : or(
            and(eq(prices.interval, 'year'), eq(prices.intervalCount, 1)),
            and(eq(prices.interval, 'month'), eq(prices.intervalCount, 12)),
            and(eq(prices.interval, 'annual'), eq(prices.intervalCount, 1)),
          );
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
          eq(prices.currency, currencyNorm),
          intervalCondition,
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
    if (!row) return null;
    return rowToPricePlan(row);
  }

  async findActiveRecurringPricesByTenantAndPlanType(
    tenantId: string,
    planType: string,
  ): Promise<PriceOptionEntity[]> {
    const rows = await this.db
      .select({
        priceId: prices.id,
        stripePriceId: prices.stripePriceId,
        currency: prices.currency,
        amountCents: prices.amountCents,
        interval: prices.interval,
        intervalCount: prices.intervalCount,
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
      .orderBy(
        asc(prices.currency),
        asc(prices.interval),
        asc(prices.amountCents),
      );
    return rows.map((r) => ({
      priceId: r.priceId,
      stripePriceId: r.stripePriceId,
      currency: r.currency,
      amountCents: r.amountCents,
      interval: r.interval,
      intervalCount: r.intervalCount,
    }));
  }

  async findPlansWithPricesByTenant(
    tenantId: string,
  ): Promise<PlanWithPricesEntity[]> {
    const rows = await this.db
      .select({
        priceId: prices.id,
        stripePriceId: prices.stripePriceId,
        currency: prices.currency,
        amountCents: prices.amountCents,
        interval: prices.interval,
        intervalCount: prices.intervalCount,
        productId: products.id,
        productName: products.name,
        planType: products.type,
      })
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
      .orderBy(
        asc(products.sortOrder),
        asc(products.type),
        asc(prices.currency),
        asc(prices.interval),
        asc(prices.amountCents),
      );
    const byPlan = new Map<string, PlanWithPricesEntity>();
    for (const r of rows) {
      const key = `${r.productId}`;
      let entry = byPlan.get(key);
      if (!entry) {
        entry = {
          planType: r.planType,
          productName: r.productName,
          productId: r.productId,
          prices: [],
        };
        byPlan.set(key, entry);
      }
      entry.prices.push({
        priceId: r.priceId,
        stripePriceId: r.stripePriceId,
        currency: r.currency,
        amountCents: r.amountCents,
        interval: r.interval,
        intervalCount: r.intervalCount,
      });
    }
    return Array.from(byPlan.values());
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
