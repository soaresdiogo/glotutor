import { makeCreateCheckoutSessionUseCase } from '@/features/subscriptions/application/factories/create-checkout-session.factory';
import type { ICreateCheckoutFromLinkUseCase } from '@/features/subscriptions/application/use-cases/create-checkout-from-link.use-case';
import { CreateCheckoutFromLinkUseCase } from '@/features/subscriptions/application/use-cases/create-checkout-from-link.use-case';
import { PendingSignupRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/pending-signup.repository';
import { db } from '@/infrastructure/db/client';

export function makeCreateCheckoutFromLinkUseCase(): ICreateCheckoutFromLinkUseCase {
  return new CreateCheckoutFromLinkUseCase(
    makeCreateCheckoutSessionUseCase(),
    new PendingSignupRepository(db),
  );
}
