import type { IListPlansUseCase } from '@/features/subscriptions/application/use-cases/list-plans.use-case';
import { ListPlansUseCase } from '@/features/subscriptions/application/use-cases/list-plans.use-case';
import { PriceRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/price.repository';
import { db } from '@/infrastructure/db/client';

export function makeListPlansUseCase(): IListPlansUseCase {
  return new ListPlansUseCase(new PriceRepository(db));
}
