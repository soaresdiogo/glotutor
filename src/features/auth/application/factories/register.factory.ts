import type { IRegisterUseCase } from '@/features/auth/application/use-cases/register.use-case';
import { RegisterUseCase } from '@/features/auth/application/use-cases/register.use-case';
import { emailVerificationRepository } from '@/features/auth/infrastructure/drizzle-repositories/email-verification.repository';
import { ConsentRecordRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/consent-record.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { emailService } from '@/infrastructure/services/email/email.service';

export function makeRegisterUseCase(): IRegisterUseCase {
  const userRepo = new UserRepository(db);
  return new RegisterUseCase(
    userRepo,
    emailVerificationRepository,
    emailService,
    new ConsentRecordRepository(db),
  );
}
