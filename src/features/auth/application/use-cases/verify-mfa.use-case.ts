import type { IUpdateUserAccessLogUseCase } from '@/features/access-log/application/use-cases/update-user-access-log.use-case';
import type { IMfaSessionRepository } from '@/features/auth/domain/repositories/mfa-session-repository.interface';
import type { ISessionRepository } from '@/features/auth/domain/repositories/session-repository.interface';
import type { IUpdateUserLastLoginUseCase } from '@/features/users/application/use-cases/update-last-login.use-case';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import {
  generateAccessToken,
  generateRefreshToken,
} from '@/shared/lib/auth/jwt';
import { REFRESH_EXPIRES_MS } from '@/shared/lib/auth/refresh-expiration';
import { hashToken } from '@/shared/lib/auth/token-hash';
import { UnauthorizedError } from '@/shared/lib/errors';

export type VerifyMfaInput = {
  sessionId: string;
  mfaCode: string;
  ipAddress: string;
  userAgent: string;
};

export interface IVerifyMfaUseCase {
  execute(input: VerifyMfaInput): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}

export class VerifyMfaUseCase implements IVerifyMfaUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly mfaSessionRepo: IMfaSessionRepository,
    private readonly sessionRepo: ISessionRepository,
    private readonly updateUserLastLogin: IUpdateUserLastLoginUseCase,
    private readonly updateUserAccessLog: IUpdateUserAccessLogUseCase,
  ) {}

  async execute(input: VerifyMfaInput): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const code = input.mfaCode.trim();
    const mfaCodeHash = hashToken(code);
    const session = await this.mfaSessionRepo.findValidByIdAndCode(
      input.sessionId,
      mfaCodeHash,
    );
    if (!session) {
      const existing = await this.mfaSessionRepo.findById(input.sessionId);
      if (existing && existing.expiresAt <= new Date()) {
        throw new UnauthorizedError(
          'Verification code has expired. Please sign in again to receive a new code.',
          'auth.verificationCodeExpired',
        );
      }
      throw new UnauthorizedError(
        'Invalid or expired verification code.',
        'auth.invalidOrExpiredVerificationCode',
      );
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError(
        'Invalid or expired verification code.',
        'auth.invalidOrExpiredVerificationCode',
      );
    }

    await this.mfaSessionRepo.deleteById(input.sessionId);

    await this.updateUserLastLogin.execute(user.userId);
    await this.updateUserAccessLog.execute({
      userId: user.userId,
      email: user.email,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    const accessToken = await generateAccessToken({
      sub: user.userId,
      accountId: user.accountId,
      tenantId: user.tenantId,
    });
    const refreshToken = await generateRefreshToken({
      sub: user.userId,
      tenantId: user.tenantId,
    });

    const refreshTokenHash = hashToken(refreshToken);

    await this.sessionRepo.create({
      userId: user.userId,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
      ipAddress: input.ipAddress,
      deviceInfo: input.userAgent?.slice(0, 500) ?? undefined,
    });

    return { accessToken, refreshToken };
  }
}
