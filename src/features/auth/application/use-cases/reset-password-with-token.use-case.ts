import type { IPasswordResetRepository } from '@/features/auth/domain/repositories/password-reset-repository.interface';
import { hashPassword } from '@/shared/lib/auth/password';
import { hashToken } from '@/shared/lib/auth/token-hash';
import { BadRequestError } from '@/shared/lib/errors';
import type { ResetPasswordWithTokenDto } from '../dto/reset-password-with-token.dto';

export interface IResetPasswordWithTokenUseCase {
  execute(dto: ResetPasswordWithTokenDto): Promise<void>;
}

export class ResetPasswordWithTokenUseCase
  implements IResetPasswordWithTokenUseCase
{
  constructor(private readonly passwordResetRepo: IPasswordResetRepository) {}

  async execute(dto: ResetPasswordWithTokenDto): Promise<void> {
    const tokenHash = hashToken(dto.token);
    const record =
      await this.passwordResetRepo.findActiveByTokenHash(tokenHash);

    if (!record) {
      throw new BadRequestError(
        'Invalid or expired reset token.',
        'auth.invalidOrExpiredResetToken',
      );
    }

    await this.passwordResetRepo.markAsUsed(record.id);
    const passwordHash = await hashPassword(dto.newPassword);
    await this.passwordResetRepo.updateUserPassword(
      record.userId,
      passwordHash,
    );
  }
}
