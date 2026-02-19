import type { IEmailVerificationRepository } from '@/features/auth/domain/repositories/email-verification-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import { hashToken } from '@/shared/lib/auth/token-hash';
import { BadRequestError } from '@/shared/lib/errors';

export interface IVerifyEmailUseCase {
  execute(token: string): Promise<void>;
}

export class VerifyEmailUseCase implements IVerifyEmailUseCase {
  constructor(
    private readonly emailVerificationRepo: IEmailVerificationRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const record =
      await this.emailVerificationRepo.findActiveByTokenHash(tokenHash);

    if (!record) {
      throw new BadRequestError(
        'Invalid or expired verification link.',
        'auth.invalidOrExpiredVerificationLink',
      );
    }

    await this.emailVerificationRepo.markAsUsed(record.id);
    await this.userRepo.updateEmailVerified(record.userId, true);
    await this.userRepo.updateStatus(record.userId, 'active');
  }
}
