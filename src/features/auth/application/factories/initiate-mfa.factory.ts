import type { IInitiateMfaUseCase } from '@/features/auth/application/use-cases/initiate-mfa.use-case';
import { InitiateMfaUseCase } from '@/features/auth/application/use-cases/initiate-mfa.use-case';
import { mfaSessionRepository } from '@/features/auth/infrastructure/drizzle-repositories/mfa-session.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { emailService } from '@/infrastructure/services/email/email.service';

export function makeInitiateMfaUseCase(): IInitiateMfaUseCase {
  const userRepo = new UserRepository(db);
  return new InitiateMfaUseCase(userRepo, mfaSessionRepository, emailService);
}
