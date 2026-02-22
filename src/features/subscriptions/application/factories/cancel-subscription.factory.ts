import type { ICancelSubscriptionUseCase } from '@/features/subscriptions/application/use-cases/cancel-subscription.use-case';
import { CancelSubscriptionUseCase } from '@/features/subscriptions/application/use-cases/cancel-subscription.use-case';
import { SubscriptionRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/subscription.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { auditLogs } from '@/infrastructure/db/schema/audit-logs';
import { stripeService } from '@/infrastructure/services/stripe/stripe.service';

const ACCOUNT_DELETION_REQUEST = 'ACCOUNT_DELETION_REQUEST';

export function makeCancelSubscriptionUseCase(): ICancelSubscriptionUseCase {
  return new CancelSubscriptionUseCase(
    new SubscriptionRepository(db),
    stripeService,
    new UserRepository(db),
    async (userId: string) => {
      await db.insert(auditLogs).values({
        userId,
        action: ACCOUNT_DELETION_REQUEST,
      });
    },
  );
}
