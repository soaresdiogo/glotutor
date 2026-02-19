import { UpdateUserAccessLogUseCase } from '@/features/access-log/application/use-cases/update-user-access-log.use-case';
import { accessLogRepository } from '@/features/access-log/infrastructure/drizzle-repositories/access-log.repository';
import type { IVerifyMfaUseCase } from '@/features/auth/application/use-cases/verify-mfa.use-case';
import { VerifyMfaUseCase } from '@/features/auth/application/use-cases/verify-mfa.use-case';
import { mfaSessionRepository } from '@/features/auth/infrastructure/drizzle-repositories/mfa-session.repository';
import { sessionRepository } from '@/features/auth/infrastructure/drizzle-repositories/session.repository';
import { UpdateUserLastLoginUseCase } from '@/features/users/application/use-cases/update-last-login.use-case';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';

export function makeVerifyMfaUseCase(): IVerifyMfaUseCase {
  const userRepo = new UserRepository(db);
  const updateLastLogin = new UpdateUserLastLoginUseCase(userRepo);
  const updateAccessLog = new UpdateUserAccessLogUseCase(accessLogRepository);
  return new VerifyMfaUseCase(
    userRepo,
    mfaSessionRepository,
    sessionRepository,
    updateLastLogin,
    updateAccessLog,
  );
}
