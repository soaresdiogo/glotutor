import type { IProcessWebhookEventUseCase } from '@/features/subscriptions/application/use-cases/process-webhook-event.use-case';
import { ProcessWebhookEventUseCase } from '@/features/subscriptions/application/use-cases/process-webhook-event.use-case';
import { PaymentHistoryRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/payment-history.repository';
import { SubscriptionRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/subscription.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { stripeService } from '@/infrastructure/services/stripe/stripe.service';

export function makeProcessWebhookEventUseCase(): IProcessWebhookEventUseCase {
  return new ProcessWebhookEventUseCase(
    stripeService,
    new SubscriptionRepository(db),
    new PaymentHistoryRepository(db),
    new UserRepository(db),
  );
}
