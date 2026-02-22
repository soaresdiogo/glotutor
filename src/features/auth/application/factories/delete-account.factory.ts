import type { IDeleteAccountUseCase } from '@/features/auth/application/use-cases/delete-account.use-case';
import { DeleteAccountUseCase } from '@/features/auth/application/use-cases/delete-account.use-case';
import { SubscriptionRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/subscription.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { stripeService } from '@/infrastructure/services/stripe/stripe.service';

export function makeDeleteAccountUseCase(): IDeleteAccountUseCase {
  return new DeleteAccountUseCase(
    new UserRepository(db),
    new SubscriptionRepository(db),
    stripeService,
  );
}
