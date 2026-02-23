import { env } from '@/env';
import type { IPendingSignupRepository } from '@/features/subscriptions/domain/repositories/pending-signup-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import { PENDING_SIGNUP_EXPIRY_HOURS } from '@/infrastructure/db/schema/pending-signups';
import type { EmailService } from '@/infrastructure/services/email/email.service';
import { signPaymentLinkToken } from '@/shared/lib/auth/jwt';
import { hashPassword } from '@/shared/lib/auth/password';
import { BadRequestError } from '@/shared/lib/errors';
import { toLocaleCode } from '@/shared/lib/translate-api-message';
import type { RequestPaymentLinkDto } from '../dto/request-payment-link.dto';

export interface IRequestPaymentLinkUseCase {
  execute(
    dto: RequestPaymentLinkDto,
    locale?: string | null,
  ): Promise<{ success: true }>;
}

export class RequestPaymentLinkUseCase implements IRequestPaymentLinkUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly pendingSignupRepo: IPendingSignupRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    dto: RequestPaymentLinkDto,
    requestLocale?: string | null,
  ): Promise<{ success: true }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestError(
        'An account with this email already exists.',
        'auth.accountAlreadyExists',
      );
    }

    const locale = toLocaleCode(dto.locale ?? requestLocale ?? 'en');

    const passwordHash = await hashPassword(dto.password);
    const expiresAt = new Date(
      Date.now() + PENDING_SIGNUP_EXPIRY_HOURS * 60 * 60 * 1000,
    );
    const now = new Date();
    await this.pendingSignupRepo.upsert({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      planType: dto.planType,
      expiresAt,
      privacyPolicyAcceptedAt: now,
      locale,
    });

    const token = await signPaymentLinkToken({
      email: dto.email,
      fullName: dto.fullName,
      planType: dto.planType,
      currency: dto.currency,
      interval: dto.interval,
    });
    const appUrl = env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const paymentLink = `${appUrl}/subscribe/continue?token=${encodeURIComponent(token)}`;

    await this.emailService.sendPaymentLinkEmail(
      dto.email,
      paymentLink,
      locale,
    );

    return { success: true };
  }
}
