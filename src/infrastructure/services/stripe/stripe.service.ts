import Stripe from 'stripe';
import { env } from '@/env';

export type CreateCheckoutSessionParams = {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  subscriptionMetadata?: Record<string, string>;
  trialPeriodDays?: number;
};

export type UpdateSubscriptionParams = {
  subscriptionId: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
};

export interface IStripeService {
  createCustomer(
    email: string,
    name?: string | null,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer>;
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{
    sessionId: string;
    url: string | null;
  }>;
  getPrice(priceId: string): Promise<Stripe.Price>;
  getCheckoutSession(
    sessionId: string,
    expand?: ('subscription' | 'customer')[],
  ): Promise<Stripe.Checkout.Session>;
  getSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
  updateSubscription(
    params: UpdateSubscriptionParams,
  ): Promise<Stripe.Subscription>;
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event;
}

function getStripe(): Stripe {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is required for Stripe operations. Set it in your environment.',
    );
  }
  return new Stripe(key);
}

class StripeServiceImpl implements IStripeService {
  async createCustomer(
    email: string,
    name?: string | null,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer> {
    const stripe = getStripe();
    return stripe.customers.create({
      email: email.toLowerCase(),
      name: name ?? undefined,
      metadata: metadata ?? undefined,
    });
  }

  async createCheckoutSession(
    params: CreateCheckoutSessionParams,
  ): Promise<{ sessionId: string; url: string | null }> {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      subscription_data: {
        trial_period_days: params.trialPeriodDays ?? 7,
        metadata: params.subscriptionMetadata ?? params.metadata,
      },
    });
    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async getPrice(priceId: string): Promise<Stripe.Price> {
    const stripe = getStripe();
    return stripe.prices.retrieve(priceId);
  }

  async getCheckoutSession(
    sessionId: string,
    expand: ('subscription' | 'customer')[] = ['subscription', 'customer'],
  ): Promise<Stripe.Checkout.Session> {
    const stripe = getStripe();
    return stripe.checkout.sessions.retrieve(sessionId, {
      expand: expand as ('subscription' | 'customer')[],
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = getStripe();
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    const stripe = getStripe();
    return stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(
    params: UpdateSubscriptionParams,
  ): Promise<Stripe.Subscription> {
    const stripe = getStripe();
    const update: Stripe.SubscriptionUpdateParams = {};
    if (params.priceId !== undefined) {
      const sub = await stripe.subscriptions.retrieve(params.subscriptionId);
      const itemId = sub.items.data[0]?.id;
      if (itemId) {
        update.items = [{ id: itemId, price: params.priceId }];
      }
    }
    if (params.cancelAtPeriodEnd !== undefined) {
      update.cancel_at_period_end = params.cancelAtPeriodEnd;
    }
    if (params.metadata !== undefined) {
      update.metadata = params.metadata;
    }
    return stripe.subscriptions.update(params.subscriptionId, update);
  }

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    const secret = env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET is required to verify webhooks. Use stripe listen for local dev.',
      );
    }
    return Stripe.webhooks.constructEvent(
      payload,
      signature,
      secret,
    ) as Stripe.Event;
  }
}

export const stripeService: IStripeService = new StripeServiceImpl();
