import type { ICompleteRegistrationUseCase } from '@/features/subscriptions/application/use-cases/complete-registration.use-case';
import { CompleteRegistrationUseCase } from '@/features/subscriptions/application/use-cases/complete-registration.use-case';
import { PendingSignupRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/pending-signup.repository';
import { SubscriptionRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/subscription.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { stripeService } from '@/infrastructure/services/stripe/stripe.service';

export function makeCompleteRegistrationUseCase(): ICompleteRegistrationUseCase {
  return new CompleteRegistrationUseCase(
    stripeService,
    new UserRepository(db),
    new SubscriptionRepository(db),
    new PendingSignupRepository(db),
  );
}
