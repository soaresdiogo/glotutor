import type { IPurgeDeletedAccountsUseCase } from '@/features/users/application/use-cases/purge-deleted-accounts.use-case';
import { PurgeDeletedAccountsUseCase } from '@/features/users/application/use-cases/purge-deleted-accounts.use-case';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';

export function makePurgeDeletedAccountsUseCase(): IPurgeDeletedAccountsUseCase {
  return new PurgeDeletedAccountsUseCase(new UserRepository(db));
}
