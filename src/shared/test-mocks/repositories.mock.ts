import type { Mock } from 'vitest';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import { createMockUser } from '@/shared/test-helpers/test-helpers';

export function createMockUserRepository(vi: { fn: () => Mock }) {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateLastLoginAt: vi.fn(),
  } as unknown as IUserRepository & {
    findByEmail: Mock;
    findById: Mock;
    create: Mock;
    updateLastLoginAt: Mock;
  };
}

export function createMockUserRepositoryWithUser(
  vi: { fn: () => Mock },
  user = createMockUser(),
) {
  const repo = createMockUserRepository(vi);
  repo.findByEmail.mockResolvedValue(user);
  repo.findById.mockResolvedValue(user);
  repo.create.mockResolvedValue(user);
  repo.updateLastLoginAt.mockResolvedValue(undefined);
  return repo;
}
