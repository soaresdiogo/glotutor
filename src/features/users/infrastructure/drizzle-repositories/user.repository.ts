import { eq } from 'drizzle-orm';
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
      })
      .returning();
    if (!row) throw new Error('Failed to create user');
    return UserMapper.toDomain(row);
  }

  async findByEmail(email: string) {
    const row = await this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findById(userId: string) {
    const row = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
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
}
