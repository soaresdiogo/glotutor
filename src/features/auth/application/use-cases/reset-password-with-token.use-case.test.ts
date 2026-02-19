import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordWithTokenUseCase } from './reset-password-with-token.use-case';

vi.mock('@/shared/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('new-hash'),
}));
vi.mock('@/shared/lib/auth/token-hash', () => ({
  hashToken: vi.fn((t: string) => `hash-${t}`),
}));

describe('ResetPasswordWithTokenUseCase', () => {
  let useCase: ResetPasswordWithTokenUseCase;
  let mockPasswordResetRepo: {
    findActiveByTokenHash: ReturnType<typeof vi.fn>;
    markAsUsed: ReturnType<typeof vi.fn>;
    updateUserPassword: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPasswordResetRepo = {
      findActiveByTokenHash: vi.fn().mockResolvedValue({
        id: 'rec-1',
        userId: 'user-123',
        tokenHash: 'hash-token',
        used: false,
        expiresAt: new Date(Date.now() + 3600000),
      }),
      markAsUsed: vi.fn().mockResolvedValue(undefined),
      updateUserPassword: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new ResetPasswordWithTokenUseCase(mockPasswordResetRepo as never);
  });

  it('should mark token used and update password when token is valid', async () => {
    await useCase.execute({
      token: 'valid-token',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    });

    expect(mockPasswordResetRepo.findActiveByTokenHash).toHaveBeenCalledWith(
      'hash-valid-token',
    );
    expect(mockPasswordResetRepo.markAsUsed).toHaveBeenCalledWith('rec-1');
    expect(mockPasswordResetRepo.updateUserPassword).toHaveBeenCalledWith(
      'user-123',
      'new-hash',
    );
  });

  it('should throw BadRequestError when token is invalid', async () => {
    mockPasswordResetRepo.findActiveByTokenHash.mockResolvedValue(null);

    await expect(
      useCase.execute({
        token: 'bad-token',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      }),
    ).rejects.toThrow('Invalid or expired reset token.');
    expect(mockPasswordResetRepo.updateUserPassword).not.toHaveBeenCalled();
  });
});
