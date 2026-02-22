import type { IRequestPaymentLinkUseCase } from '@/features/subscriptions/application/use-cases/request-payment-link.use-case';
import { RequestPaymentLinkUseCase } from '@/features/subscriptions/application/use-cases/request-payment-link.use-case';
import { PendingSignupRepository } from '@/features/subscriptions/infrastructure/drizzle-repositories/pending-signup.repository';
import { UserRepository } from '@/features/users/infrastructure/drizzle-repositories/user.repository';
import { db } from '@/infrastructure/db/client';
import { emailService } from '@/infrastructure/services/email/email.service';

export function makeRequestPaymentLinkUseCase(): IRequestPaymentLinkUseCase {
  return new RequestPaymentLinkUseCase(
    new UserRepository(db),
    new PendingSignupRepository(db),
    emailService,
  );
}
