import { randomBytes } from 'node:crypto';
import type { IEmailVerificationRepository } from '@/features/auth/domain/repositories/email-verification-repository.interface';
import type { IConsentRecordRepository } from '@/features/subscriptions/domain/repositories/consent-record-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import type { EmailService } from '@/infrastructure/services/email/email.service';
import { hashPassword } from '@/shared/lib/auth/password';
import { hashToken } from '@/shared/lib/auth/token-hash';
import { BadRequestError } from '@/shared/lib/errors';
import type { RegisterDto } from '../dto/register.dto';

const EMAIL_VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24 hours
const EMAIL_VERIFICATION_TYPE = 'signup';
const PRIVACY_POLICY_CONSENT_VERSION = '2026-01-17';
const PRIVACY_POLICY_CONSENT_TYPE = 'privacy_policy';
const TERMS_OF_USE_CONSENT_VERSION = '2026-01-17';
const TERMS_OF_USE_CONSENT_TYPE = 'terms_of_use';

export interface IRegisterUseCase {
  execute(dto: RegisterDto): Promise<{ userId: string; email: string }>;
}

export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailVerificationRepo: IEmailVerificationRepository,
    private readonly emailService: EmailService,
    private readonly consentRecordRepo: IConsentRecordRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<{ userId: string; email: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestError(
        'An account with this email already exists.',
        'auth.accountAlreadyExists',
      );
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name ?? null,
    });

    const now = new Date();
    await this.consentRecordRepo.create({
      userId: user.userId,
      consentType: PRIVACY_POLICY_CONSENT_TYPE,
      version: PRIVACY_POLICY_CONSENT_VERSION,
      granted: true,
      grantedAt: now,
    });
    await this.consentRecordRepo.create({
      userId: user.userId,
      consentType: TERMS_OF_USE_CONSENT_TYPE,
      version: TERMS_OF_USE_CONSENT_VERSION,
      granted: true,
      grantedAt: now,
    });

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_MS);

    await this.emailVerificationRepo.create({
      userId: user.userId,
      tokenHash,
      type: EMAIL_VERIFICATION_TYPE,
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const verifyLink = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await this.emailService.sendVerificationEmail(user.email, verifyLink);

    return { userId: user.userId, email: user.email };
  }
}
