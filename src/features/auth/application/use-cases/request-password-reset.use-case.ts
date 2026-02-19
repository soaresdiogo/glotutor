import { randomBytes } from 'crypto';
import type { IPasswordResetRepository } from '@/features/auth/domain/repositories/password-reset-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import type { EmailService } from '@/infrastructure/services/email/email.service';
import { hashToken } from '@/shared/lib/auth/token-hash';

const RESET_EXPIRES_MS = 60 * 60 * 1000; // 1 hour

export interface IRequestPasswordResetUseCase {
  execute(email: string): Promise<void>;
}

export class RequestPasswordResetUseCase
  implements IRequestPasswordResetUseCase
{
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordResetRepo: IPasswordResetRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_EXPIRES_MS);

    await this.passwordResetRepo.create({
      userId: user.userId,
      tokenHash,
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await this.emailService.sendPasswordResetEmail(user.email, resetLink);
  }
}
