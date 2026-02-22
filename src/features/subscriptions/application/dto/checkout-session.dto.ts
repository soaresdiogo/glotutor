export type CheckoutSessionDto = {
  sessionId: string;
  paymentStatus: string;
  customerEmail: string | null;
  subscriptionId: string | null;
  metadata: Record<string, string>;
};
