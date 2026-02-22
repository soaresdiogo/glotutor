import { and, eq, isNotNull, isNull, lt } from 'drizzle-orm';
import type {
  CreateUserInput,
  IUserRepository,
} from '@/features/users/domain/repositories/user-repository.interface';
import { UserMapper } from '@/features/users/infrastructure/mappers/user.mapper';
import { users } from '@/infrastructure/db/schema/users';
import type { DbClient } from '@/infrastructure/db/types';

export class UserRepository implements IUserRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreateUserInput) {
    const [row] = await this.db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name ?? null,
        tenantId: data.tenantId ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create user');
    return UserMapper.toDomain(row);
  }

  async findByEmail(email: string) {
    const row = await this.db.query.users.findFirst({
      where: and(eq(users.email, email.toLowerCase()), isNull(users.deletedAt)),
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findById(userId: string) {
    const row = await this.db.query.users.findFirst({
      where: and(eq(users.id, userId), isNull(users.deletedAt)),
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async updateLastLoginAt(userId: string) {
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateEmailVerified(userId: string, verified: boolean) {
    await this.db
      .update(users)
      .set({ emailVerified: verified, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateStatus(userId: string, status: string) {
    await this.db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setDeletedAt(userId: string, deletedAt: Date | null) {
    await this.db
      .update(users)
      .set({ deletedAt, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setDeletionRequestedAt(userId: string, at: Date) {
    await this.db
      .update(users)
      .set({ deletionRequestedAt: at, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setDeletedAtIfDeletionRequested(userId: string): Promise<boolean> {
    const [row] = await this.db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(users.id, userId),
          isNotNull(users.deletionRequestedAt),
          isNull(users.deletedAt),
        ),
      )
      .returning({ id: users.id });
    return row != null;
  }

  async findDeletedBefore(before: Date): Promise<string[]> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(isNotNull(users.deletedAt), lt(users.deletedAt, before)));
    return rows.map((r) => r.id);
  }

  async anonymizeUser(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        email: `deleted_${userId}@deleted.local`,
        name: null,
        passwordHash: '__PURGED__',
        avatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
