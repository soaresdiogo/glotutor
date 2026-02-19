import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateAccessToken, verifyToken } from '@/shared/lib/auth/jwt';
import { createMockUser } from '@/shared/test-helpers/test-helpers';
import { createMockUserRepository } from '@/shared/test-mocks/repositories.mock';
import { RefreshAuthTokenUseCase } from './refresh-auth-token.use-case';

vi.mock('@/shared/lib/auth/jwt', () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn().mockResolvedValue('new-refresh-token'),
  verifyToken: vi.fn(),
}));
vi.mock('@/shared/lib/auth/token-hash', () => ({
  hashToken: vi.fn((t: string) => `hash-${t}`),
}));

describe('RefreshAuthTokenUseCase', () => {
  let useCase: RefreshAuthTokenUseCase;
  let mockUserRepo: ReturnType<typeof createMockUserRepository>;
  let mockSessionRepo: {
    findByRefreshTokenHash: ReturnType<typeof vi.fn>;
    deleteById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = createMockUserRepository(vi);
    mockSessionRepo = {
      findByRefreshTokenHash: vi.fn().mockResolvedValue({
        id: 'sess-1',
        userId: 'user-123',
        refreshTokenHash: 'hash-xxx',
        expiresAt: new Date(Date.now() + 86400000),
        deviceInfo: null,
        ipAddress: null,
      }),
      deleteById: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new RefreshAuthTokenUseCase(
      mockUserRepo as never,
      mockSessionRepo as never,
    );
  });

  it('should return new access token and refresh token when valid', async () => {
    const mockUser = createMockUser({ userId: 'user-123' });
    vi.mocked(verifyToken).mockResolvedValue({
      payload: {
        type: 'refresh',
        sub: 'user-123',
        tenantId: 'tenant-123',
      },
    } as never);
    mockUserRepo.findById.mockResolvedValue(mockUser);
    vi.mocked(generateAccessToken).mockResolvedValue('new-access-token');

    const result = await useCase.execute('valid-refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(verifyToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(mockSessionRepo.deleteById).toHaveBeenCalledWith('sess-1');
    expect(mockSessionRepo.create).toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when token type is not refresh', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      payload: { type: 'access', sub: 'user-123' },
    } as never);

    await expect(useCase.execute('wrong-type-token')).rejects.toThrow(
      'Invalid token type.',
    );
    expect(mockSessionRepo.deleteById).not.toHaveBeenCalled();
  });
});
