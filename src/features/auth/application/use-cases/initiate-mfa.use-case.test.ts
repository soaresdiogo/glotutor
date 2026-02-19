import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockUser } from '@/shared/test-helpers/test-helpers';
import { createMockUserRepository } from '@/shared/test-mocks/repositories.mock';
import { InitiateMfaUseCase } from './initiate-mfa.use-case';

vi.mock('@/shared/lib/auth/password', () => ({
  comparePassword: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/shared/lib/auth/token-hash', () => ({
  hashToken: vi.fn((s: string) => `hash-${s}`),
}));

describe('InitiateMfaUseCase', () => {
  let useCase: InitiateMfaUseCase;
  let mockUserRepo: ReturnType<typeof createMockUserRepository>;
  let mockMfaSessionRepo: {
    create: ReturnType<typeof vi.fn>;
  };
  let mockEmailService: {
    sendMfaCodeEmail: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = createMockUserRepository(vi);
    mockUserRepo.findByEmail.mockResolvedValue(
      createMockUser({ emailVerified: true }),
    );
    mockMfaSessionRepo = {
      create: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
    };
    mockEmailService = {
      sendMfaCodeEmail: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new InitiateMfaUseCase(
      mockUserRepo as never,
      mockMfaSessionRepo as never,
      mockEmailService as never,
    );
  });

  it('should return sessionId and send MFA email when credentials are valid', async () => {
    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ sessionId: 'session-123' });
    expect(mockMfaSessionRepo.create).toHaveBeenCalled();
    expect(mockEmailService.sendMfaCodeEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.any(String),
    );
  });

  it('should throw ForbiddenError when email is not verified', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(
      createMockUser({ emailVerified: false }),
    );

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Please verify your email before signing in.');

    expect(mockMfaSessionRepo.create).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'pass' }),
    ).rejects.toThrow('Invalid email or password.');
    expect(mockMfaSessionRepo.create).not.toHaveBeenCalled();
  });
});
