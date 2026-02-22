import type { IGetMySubscriptionUseCase } from '@/features/subscriptions/application/use-cases/get-my-subscription.use-case';
import { GetMySubscriptionUseCase } from '@/features/subscriptions/application/use-cases/get-my-subscription.use-case';
import { SubscriptionRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/subscription.repository';
import { db } from '@/infrastructure/db/client';

export function makeGetMySubscriptionUseCase(): IGetMySubscriptionUseCase {
  return new GetMySubscriptionUseCase(new SubscriptionRepository(db));
}
