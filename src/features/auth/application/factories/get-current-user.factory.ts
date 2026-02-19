import type { IGetCurrentUserUseCase } from '@/features/auth/application/use-cases/get-current-user.use-case';
import { GetCurrentUserUseCase } from '@/features/auth/application/use-cases/get-current-user.use-case';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';

export function makeGetCurrentUserUseCase(): IGetCurrentUserUseCase {
  return new GetCurrentUserUseCase(new UserRepository(db));
}
