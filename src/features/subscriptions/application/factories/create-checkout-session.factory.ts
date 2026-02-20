import type { ICreateCheckoutSessionUseCase } from '@/features/subscriptions/application/use-cases/create-checkout-session.use-case';
import { CreateCheckoutSessionUseCase } from '@/features/subscriptions/application/use-cases/create-checkout-session.use-case';
import { PendingSignupRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/pending-signup.repository';
import { PriceRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/price.repository';
import { SubscriptionRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/subscription.repository';
import { db } from '@/infrastructure/db/client';
import { stripeService } from '@/infrastructure/services/stripe/stripe.service';

export function makeCreateCheckoutSessionUseCase(): ICreateCheckoutSessionUseCase {
  return new CreateCheckoutSessionUseCase(
    new PriceRepository(db),
    new SubscriptionRepository(db),
    new PendingSignupRepository(db),
    stripeService,
  );
}
