import type { IRefreshAuthTokenUseCase } from '@/features/auth/application/use-cases/refresh-auth-token.use-case';
import { RefreshAuthTokenUseCase } from '@/features/auth/application/use-cases/refresh-auth-token.use-case';
import { sessionRepository } from '@/features/auth/infrastructure/drizzle-repositories/session.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';

export function makeRefreshAuthTokenUseCase(): IRefreshAuthTokenUseCase {
  const userRepo = new UserRepository(db);
  return new RefreshAuthTokenUseCase(userRepo, sessionRepository);
}
