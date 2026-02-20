import { eq } from 'drizzle-orm';
import type {
  CreatePaymentRecordInput,
  IPaymentHistoryRepository,
} from '@/features/subscriptions/domain/repositories/payment-history-repository.interface';
import { paymentHistory } from '@/infrastructure/db/schema/payment-history';
import type { DbClient } from '@/infrastructure/db/types';

export class PaymentHistoryRepository implements IPaymentHistoryRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreatePaymentRecordInput): Promise<void> {
    await this.db.insert(paymentHistory).values({
      subscriptionId: data.subscriptionId,
      userId: data.userId,
      stripeInvoiceId: data.stripeInvoiceId,
      stripeChargeId: data.stripeChargeId,
      amountCents: data.amountCents,
      currency: data.currency,
      status: data.status,
      paymentMethod: data.paymentMethod ?? null,
      receiptUrl: data.receiptUrl ?? null,
      invoicePdfUrl: data.invoicePdfUrl ?? null,
      paidAt: data.paidAt ?? null,
    });
  }

  async findByStripeInvoiceId(
    stripeInvoiceId: string,
  ): Promise<{ id: string } | null> {
    const row = await this.db.query.paymentHistory.findFirst({
      where: eq(paymentHistory.stripeInvoiceId, stripeInvoiceId),
      columns: { id: true },
    });
    return row ?? null;
  }
}
