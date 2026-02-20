import type Stripe from 'stripe';
import type { CheckoutSessionDto } from '@/features/subscriptions/application/dto/checkout-session.dto';

export const CheckoutSessionPresenter = {
  toDto(session: Stripe.Checkout.Session): CheckoutSessionDto {
    const subscription =
      typeof session.subscription === 'object' && session.subscription
        ? session.subscription
        : null;
    return {
      sessionId: session.id ?? '',
      paymentStatus: session.payment_status ?? 'unpaid',
      customerEmail:
        session.customer_email ?? session.customer_details?.email ?? null,
      subscriptionId:
        subscription?.id ?? (session.subscription as string) ?? null,
      metadata: (session.metadata as Record<string, string>) ?? {},
    };
  },
};
