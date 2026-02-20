import type { ICheckSubscriptionAvailabilityUseCase } from '@/features/subscriptions/application/use-cases/check-subscription-availability.use-case';
import { CheckSubscriptionAvailabilityUseCase } from '@/features/subscriptions/application/use-cases/check-subscription-availability.use-case';
import { PriceRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/price.repository';
import { db } from '@/infrastructure/db/client';

export function makeCheckSubscriptionAvailabilityUseCase(): ICheckSubscriptionAvailabilityUseCase {
  return new CheckSubscriptionAvailabilityUseCase(new PriceRepository(db));
}
