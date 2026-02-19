import { and, eq, gt } from 'drizzle-orm';
import type {
  CreatePasswordResetInput,
  IPasswordResetRepository,
  PasswordResetRecord,
} from '@/features/auth/domain/repositories/password-reset-repository.interface';
import { db } from '@/infrastructure/db/client';
import { passwordResetTokens } from '@/infrastructure/db/schema/password-reset-tokens';
import { users } from '@/infrastructure/db/schema/users';
import type { DbClient } from '@/infrastructure/db/types';

export class PasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly dbClient: DbClient) {}

  async create(data: CreatePasswordResetInput): Promise<PasswordResetRecord> {
    const [row] = await this.dbClient
      .insert(passwordResetTokens)
      .values({
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      })
      .returning();
    if (!row) throw new Error('Failed to create password reset record');
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      used: row.used,
      expiresAt: row.expiresAt,
    };
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetRecord | null> {
    const row = await this.dbClient.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      used: row.used,
      expiresAt: row.expiresAt,
    };
  }

  async markAsUsed(id: string): Promise<void> {
    await this.dbClient
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id));
  }

  async updateUserPassword(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.dbClient
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export const passwordResetRepository = new PasswordResetRepository(db);
