import type { ISessionRepository } from '@/features/auth/domain/repositories/session-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '@/shared/lib/auth/jwt';
import { REFRESH_EXPIRES_MS } from '@/shared/lib/auth/refresh-expiration';
import { hashToken } from '@/shared/lib/auth/token-hash';
import { UnauthorizedError } from '@/shared/lib/errors';

export interface IRefreshAuthTokenUseCase {
  execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}

export class RefreshAuthTokenUseCase implements IRefreshAuthTokenUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { payload } = await verifyToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError(
        'Invalid token type.',
        'auth.invalidTokenType',
      );
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found.', 'auth.userNotFound');
    }

    const refreshTokenHash = hashToken(refreshToken);
    const session =
      await this.sessionRepo.findByRefreshTokenHash(refreshTokenHash);
    if (!session) {
      throw new UnauthorizedError(
        'Session not found or expired.',
        'auth.sessionNotFoundOrExpired',
      );
    }
    if (session.expiresAt <= new Date()) {
      await this.sessionRepo.deleteById(session.id);
      throw new UnauthorizedError(
        'Session expired. Please sign in again.',
        'auth.sessionExpired',
      );
    }

    await this.sessionRepo.deleteById(session.id);

    const newAccessToken = await generateAccessToken({
      sub: user.userId,
      accountId: user.accountId,
      tenantId: user.tenantId,
    });
    const newRefreshToken = await generateRefreshToken({
      sub: user.userId,
      tenantId: user.tenantId,
    });

    await this.sessionRepo.create({
      userId: user.userId,
      refreshTokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
