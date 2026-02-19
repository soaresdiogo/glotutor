import type { IRequestPasswordResetUseCase } from '@/features/auth/application/use-cases/request-password-reset.use-case';
import { RequestPasswordResetUseCase } from '@/features/auth/application/use-cases/request-password-reset.use-case';
import { passwordResetRepository } from '@/features/auth/infrastructure/drizzle-repositories/password-reset.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { emailService } from '@/infrastructure/services/email/email.service';

export function makeRequestPasswordResetUseCase(): IRequestPasswordResetUseCase {
  const userRepo = new UserRepository(db);
  return new RequestPasswordResetUseCase(
    userRepo,
    passwordResetRepository,
    emailService,
  );
}
