import type { IVerifyEmailUseCase } from '@/features/auth/application/use-cases/verify-email.use-case';
import { VerifyEmailUseCase } from '@/features/auth/application/use-cases/verify-email.use-case';
import { emailVerificationRepository } from '@/features/auth/infrastructure/drizzle-repositories/email-verification.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';

export function makeVerifyEmailUseCase(): IVerifyEmailUseCase {
  const userRepo = new UserRepository(db);
  return new VerifyEmailUseCase(emailVerificationRepository, userRepo);
}
