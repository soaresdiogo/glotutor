export type PricePlanEntity = {
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
};
