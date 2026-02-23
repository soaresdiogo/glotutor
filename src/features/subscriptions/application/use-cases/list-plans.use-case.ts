import type { IPriceRepository } from '@/features/subscriptions/domain/repositories/price-repository.interface';

export type ListPlansResult = {
  plans: Array<{
    planType: string;
    productName: string;
    productId: string;
    prices: Array<{
      priceId: string;
      currency: string;
      amountCents: number;
      interval: string;
      intervalCount: number;
    }>;
  }>;
};

export interface IListPlansUseCase {
  execute(tenantId: string): Promise<ListPlansResult>;
}

export class ListPlansUseCase implements IListPlansUseCase {
  constructor(private readonly priceRepo: IPriceRepository) {}

  async execute(tenantId: string): Promise<ListPlansResult> {
    const plans = await this.priceRepo.findPlansWithPricesByTenant(tenantId);
    return {
      plans: plans.map((p) => ({
        planType: p.planType,
        productName: p.productName,
        productId: p.productId,
        prices: p.prices.map((pr) => ({
          priceId: pr.priceId,
          currency: pr.currency,
          amountCents: pr.amountCents,
          interval: pr.interval,
          intervalCount: pr.intervalCount,
        })),
      })),
    };
  }
}
