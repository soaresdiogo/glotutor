import type { UserEntity } from '@/features/users/domain/entities/user.entity';
import type { users } from '@/infrastructure/db/schema/users';

type UserRow = typeof users.$inferSelect;

export const UserMapper = {
  toDomain(row: UserRow): UserEntity {
    return {
      userId: row.id,
      tenantId: row.tenantId,
      accountId: row.tenantId,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name,
      role: row.role,
      emailVerified: row.emailVerified,
      mfaEnabled: row.mfaEnabled,
      status: row.status,
      lastLoginAt: row.lastLoginAt,
    };
  },
};
