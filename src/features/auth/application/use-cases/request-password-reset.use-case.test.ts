import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockUser } from '@/shared/test-helpers/test-helpers';
import { createMockUserRepository } from '@/shared/test-mocks/repositories.mock';
import { RequestPasswordResetUseCase } from './request-password-reset.use-case';

vi.mock('@/shared/lib/auth/token-hash', () => ({
  hashToken: vi.fn((t: string) => `hash-${t}`),
}));

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let mockUserRepo: ReturnType<typeof createMockUserRepository>;
  let mockPasswordResetRepo: {
    create: ReturnType<typeof vi.fn>;
  };
  let mockEmailService: {
    sendPasswordResetEmail: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = createMockUserRepository(vi);
    mockUserRepo.findByEmail.mockResolvedValue(createMockUser());
    mockPasswordResetRepo = {
      create: vi.fn().mockResolvedValue(undefined),
    };
    mockEmailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new RequestPasswordResetUseCase(
      mockUserRepo as never,
      mockPasswordResetRepo as never,
      mockEmailService as never,
    );
  });

  it('should create reset record and send email when user exists', async () => {
    await useCase.execute('user@example.com');

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockPasswordResetRepo.create).toHaveBeenCalled();
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.stringContaining('reset-password'),
    );
  });

  it('should do nothing when user does not exist', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await useCase.execute('unknown@example.com');

    expect(mockPasswordResetRepo.create).not.toHaveBeenCalled();
    expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});
