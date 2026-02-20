export type CreateCheckoutResponseDto = {
  checkoutSessionId: string;
  checkoutUrl: string | null;
  customerId: string;
  plan: {
    planType: string;
    priceId: string;
    productName: string;
    currency: string;
    amountCents: number;
    interval: string;
  };
};
