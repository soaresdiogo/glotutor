import type { UserEntity } from '@/features/users/domain/entities/user.entity';

export function createMockUser(
  overrides: Partial<UserEntity> = {},
): UserEntity {
  return {
    userId: 'user-123',
    tenantId: 'tenant-123',
    accountId: 'tenant-123',
    email: 'user@example.com',
    passwordHash: '$2a$12$hashed',
    name: 'Test User',
    role: 'student',
    emailVerified: false,
    mfaEnabled: false,
    status: 'pending',
    lastLoginAt: null,
    locale: null,
    ...overrides,
  };
}
