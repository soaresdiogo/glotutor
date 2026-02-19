import { and, eq, gt } from 'drizzle-orm';
import type {
  CreateEmailVerificationInput,
  EmailVerificationRecord,
  IEmailVerificationRepository,
} from '@/features/auth/domain/repositories/email-verification-repository.interface';
import { db } from '@/infrastructure/db/client';
import { emailVerificationTokens } from '@/infrastructure/db/schema/email-verification-tokens';
import type { DbClient } from '@/infrastructure/db/types';

export class EmailVerificationRepository
  implements IEmailVerificationRepository
{
  constructor(private readonly dbClient: DbClient) {}

  async create(
    data: CreateEmailVerificationInput,
  ): Promise<EmailVerificationRecord> {
    const [row] = await this.dbClient
      .insert(emailVerificationTokens)
      .values({
        userId: data.userId,
        tokenHash: data.tokenHash,
        type: data.type,
        expiresAt: data.expiresAt,
      })
      .returning();
    if (!row) throw new Error('Failed to create email verification record');
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      type: row.type,
      used: row.used,
      expiresAt: row.expiresAt,
    };
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationRecord | null> {
    const row = await this.dbClient.query.emailVerificationTokens.findFirst({
      where: and(
        eq(emailVerificationTokens.tokenHash, tokenHash),
        eq(emailVerificationTokens.used, false),
        gt(emailVerificationTokens.expiresAt, new Date()),
      ),
    });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      type: row.type,
      used: row.used,
      expiresAt: row.expiresAt,
    };
  }

  async markAsUsed(id: string): Promise<void> {
    await this.dbClient
      .update(emailVerificationTokens)
      .set({ used: true })
      .where(eq(emailVerificationTokens.id, id));
  }
}

export const emailVerificationRepository = new EmailVerificationRepository(db);
