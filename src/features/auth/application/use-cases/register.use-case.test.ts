import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockUser } from '@/shared/test-helpers/test-helpers';
import { createMockUserRepository } from '@/shared/test-mocks/repositories.mock';
import { RegisterUseCase } from './register.use-case';

vi.mock('@/shared/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
}));
vi.mock('@/shared/lib/auth/token-hash', () => ({
  hashToken: vi.fn((t: string) => `hash-${t}`),
}));
vi.mock('node:crypto', () => ({
  randomBytes: vi.fn(() => ({ toString: () => 'hex-token' })),
}));

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockUserRepo: ReturnType<typeof createMockUserRepository>;
  let mockEmailVerificationRepo: {
    create: ReturnType<typeof vi.fn>;
  };
  let mockEmailService: {
    sendVerificationEmail: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = createMockUserRepository(vi);
    mockEmailVerificationRepo = {
      create: vi.fn().mockResolvedValue(undefined),
    };
    mockEmailService = {
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new RegisterUseCase(
      mockUserRepo,
      mockEmailVerificationRepo as never,
      mockEmailService as never,
    );
  });

  it('should create a new user and send verification email when email is not taken', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.create.mockResolvedValue(
      createMockUser({ userId: 'new-id', email: 'new@example.com' }),
    );

    const result = await useCase.execute({
      name: 'New User',
      email: 'new@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });

    expect(result).toEqual({ userId: 'new-id', email: 'new@example.com' });
    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(mockUserRepo.create).toHaveBeenCalledWith({
      email: 'new@example.com',
      passwordHash: 'hashed-password',
      name: 'New User',
    });
    expect(mockEmailVerificationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'new-id',
        type: 'signup',
      }),
    );
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
      'new@example.com',
      expect.stringContaining('/verify-email?token='),
    );
  });

  it('should throw BadRequestError when email is already taken', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(createMockUser());

    await expect(
      useCase.execute({
        name: 'Existing User',
        email: 'user@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      }),
    ).rejects.toThrow('An account with this email already exists.');

    expect(mockUserRepo.create).not.toHaveBeenCalled();
  });
});
