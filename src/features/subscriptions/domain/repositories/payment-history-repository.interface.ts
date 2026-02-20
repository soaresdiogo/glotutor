export type CreatePaymentRecordInput = {
  subscriptionId: string | null;
  userId: string;
  stripeInvoiceId: string | null;
  stripeChargeId: string | null;
  amountCents: number;
  currency: string;
  status: string;
  paymentMethod?: string | null;
  receiptUrl?: string | null;
  invoicePdfUrl?: string | null;
  paidAt?: Date | null;
};

export interface IPaymentHistoryRepository {
  create(data: CreatePaymentRecordInput): Promise<void>;
  findByStripeInvoiceId(
    stripeInvoiceId: string,
  ): Promise<{ id: string } | null>;
}
