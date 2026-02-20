import type Stripe from 'stripe';
import type { SubscriptionEntity } from '@/features/subscriptions/domain/entities/subscription.entity';
import type { IPaymentHistoryRepository } from '@/features/subscriptions/domain/repositories/payment-history-repository.interface';
import type { ISubscriptionRepository } from '@/features/subscriptions/domain/repositories/subscription-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import type { IStripeService } from '@/infrastructure/services/stripe/stripe.service';

/** Stripe invoice fields we use for payment history. */
type StripeInvoiceFields = {
  id: string | null;
  subscription?: string | { id: string };
  charge?: string | { id: string };
  amount_paid?: number;
  amount_due?: number;
  currency?: string;
  status_transitions?: { paid_at?: number | null };
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
};

/** Stripe subscription fields we use when creating a subscription record. */
type StripeSubscriptionFields = {
  id: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  trial_start?: number;
  trial_end?: number;
  cancel_at_period_end?: boolean;
  canceled_at?: number;
};

function mapStripeSubscriptionStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return stripeStatus;
  }
}

export type ProcessWebhookInput = {
  rawBody: string | Buffer;
  signature: string;
};

export interface IProcessWebhookEventUseCase {
  execute(input: ProcessWebhookInput): Promise<void>;
}

export class ProcessWebhookEventUseCase implements IProcessWebhookEventUseCase {
  constructor(
    private readonly stripeService: IStripeService,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly paymentHistoryRepo: IPaymentHistoryRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ProcessWebhookInput): Promise<void> {
    const event = this.stripeService.constructWebhookEvent(
      input.rawBody,
      input.signature,
    );
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpsert(
          event.data.object as StripeSubscriptionFields,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as StripeSubscriptionFields,
        );
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        break;
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    if (session.mode !== 'subscription') return;
    const subscriptionId = this.getSubscriptionIdFromSession(session);
    if (!subscriptionId) return;
    if (await this.subscriptionRepo.findByStripeSubscriptionId(subscriptionId))
      return;

    const metadata = (session.metadata as Record<string, string>) ?? {};
    const priceId = metadata.priceId ?? metadata.planId;
    if (!priceId) return;

    const userId = await this.resolveUserIdForCheckout(session, metadata);
    if (!userId) return;

    const sub = await this.stripeService.getSubscription(subscriptionId);
    await this.subscriptionRepo.create(
      this.subscriptionCreatePayload(
        sub as StripeSubscriptionFields,
        userId,
        metadata.tenantId ?? null,
        priceId,
        this.getCustomerIdFromSession(session),
      ),
    );
  }

  private getSubscriptionIdFromSession(
    session: Stripe.Checkout.Session,
  ): string | null {
    if (typeof session.subscription === 'string') return session.subscription;
    return session.subscription?.id ?? null;
  }

  private getCustomerIdFromSession(
    session: Stripe.Checkout.Session,
  ): string | null {
    if (typeof session.customer === 'string') return session.customer;
    return session.customer?.id ?? null;
  }

  private async resolveUserIdForCheckout(
    session: Stripe.Checkout.Session,
    metadata: Record<string, string>,
  ): Promise<string | null> {
    const accountId = metadata.accountId ?? null;
    if (accountId) return accountId;
    if (!session.customer_email) return null;
    const user = await this.userRepo.findByEmail(
      session.customer_email.toLowerCase(),
    );
    return user?.userId ?? null;
  }

  private subscriptionCreatePayload(
    sub: StripeSubscriptionFields,
    userId: string,
    tenantId: string | null,
    priceId: string,
    stripeCustomerId: string | null,
  ) {
    return {
      userId,
      tenantId,
      priceId,
      stripeSubscriptionId: sub.id,
      stripeCustomerId,
      status: mapStripeSubscriptionStatus(sub.status),
      currentPeriodStart: sub.current_period_start
        ? new Date(sub.current_period_start * 1000)
        : null,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
      trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    };
  }

  private async handleSubscriptionUpsert(
    sub: StripeSubscriptionFields,
  ): Promise<void> {
    const existing = await this.subscriptionRepo.findByStripeSubscriptionId(
      sub.id,
    );
    const status = mapStripeSubscriptionStatus(sub.status);
    const update = {
      status,
      currentPeriodStart: sub.current_period_start
        ? new Date(sub.current_period_start * 1000)
        : null,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
      trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    };
    if (existing) {
      await this.subscriptionRepo.update(existing.id, update);
    }
  }

  private async handleSubscriptionDeleted(
    sub: StripeSubscriptionFields,
  ): Promise<void> {
    const existing = await this.subscriptionRepo.findByStripeSubscriptionId(
      sub.id,
    );
    if (!existing) return;
    await this.subscriptionRepo.update(existing.id, {
      status: 'canceled',
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : new Date(),
    });
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const inv = invoice as unknown as StripeInvoiceFields;
    if (await this.isInvoiceAlreadyRecorded(inv.id)) return;
    const { subscription, userId } =
      await this.resolveSubscriptionAndUserIdForInvoice(inv);
    if (!userId) return;
    await this.paymentHistoryRepo.create(
      this.paymentRecordForSucceededInvoice(inv, subscription, userId),
    );
    await this.activateSubscriptionIfTrialing(subscription);
  }

  private async isInvoiceAlreadyRecorded(
    invoiceId: string | null,
  ): Promise<boolean> {
    if (!invoiceId) return false;
    return (
      (await this.paymentHistoryRepo.findByStripeInvoiceId(invoiceId)) !== null
    );
  }

  private getSubscriptionIdFromInvoice(
    invoice: StripeInvoiceFields,
  ): string | null {
    if (typeof invoice.subscription === 'string') return invoice.subscription;
    return invoice.subscription?.id ?? null;
  }

  private getChargeIdFromInvoice(invoice: StripeInvoiceFields): string | null {
    if (typeof invoice.charge === 'string') return invoice.charge;
    return invoice.charge?.id ?? null;
  }

  private async resolveSubscriptionAndUserIdForInvoice(
    invoice: StripeInvoiceFields,
  ): Promise<{
    subscription: SubscriptionEntity | null;
    userId: string | null;
  }> {
    const subscriptionId = this.getSubscriptionIdFromInvoice(invoice);
    if (!subscriptionId) return { subscription: null, userId: null };
    const subscription =
      await this.subscriptionRepo.findByStripeSubscriptionId(subscriptionId);
    return {
      subscription,
      userId: subscription?.userId ?? null,
    };
  }

  private paymentRecordForSucceededInvoice(
    invoice: StripeInvoiceFields,
    subscription: { id: string } | null,
    userId: string,
  ) {
    return {
      subscriptionId: subscription?.id ?? null,
      userId,
      stripeInvoiceId: invoice.id,
      stripeChargeId: this.getChargeIdFromInvoice(invoice),
      amountCents: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? 'usd',
      status: 'succeeded',
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
      receiptUrl: invoice.hosted_invoice_url ?? null,
      invoicePdfUrl: invoice.invoice_pdf ?? null,
    };
  }

  private async activateSubscriptionIfTrialing(
    subscription: { id: string; status: string } | null,
  ): Promise<void> {
    if (subscription?.status !== 'trialing') return;
    await this.subscriptionRepo.update(subscription.id, { status: 'active' });
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const inv = invoice as unknown as StripeInvoiceFields;
    if (await this.isInvoiceAlreadyRecorded(inv.id)) return;
    const { subscription, userId } =
      await this.resolveSubscriptionAndUserIdForInvoice(inv);
    if (!userId) return;
    await this.paymentHistoryRepo.create({
      subscriptionId: subscription?.id ?? null,
      userId,
      stripeInvoiceId: inv.id,
      stripeChargeId: null,
      amountCents: inv.amount_due ?? 0,
      currency: inv.currency ?? 'usd',
      status: 'failed',
    });
  }
}
