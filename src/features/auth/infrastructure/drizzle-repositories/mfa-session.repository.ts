import { and, eq, gt } from 'drizzle-orm';
import type {
  CreateMfaSessionInput,
  IMfaSessionRepository,
} from '@/features/auth/domain/repositories/mfa-session-repository.interface';
import { MfaSessionMapper } from '@/features/auth/infrastructure/mappers/mfa-session.mapper';
import { db } from '@/infrastructure/db/client';
import { mfaSessions } from '@/infrastructure/db/schema/mfa-sessions';
import type { DbClient } from '@/infrastructure/db/types';

export class MfaSessionRepository implements IMfaSessionRepository {
  constructor(private readonly dbClient: DbClient) {}

  async create(data: CreateMfaSessionInput) {
    const [row] = await this.dbClient
      .insert(mfaSessions)
      .values({
        userId: data.userId,
        mfaCodeHash: data.mfaCodeHash,
        expiresAt: data.expiresAt,
      })
      .returning();
    if (!row) throw new Error('Failed to create MFA session');
    return MfaSessionMapper.toDomain(row);
  }

  async findById(sessionId: string) {
    const row = await this.dbClient.query.mfaSessions.findFirst({
      where: eq(mfaSessions.id, sessionId),
    });
    return row ? MfaSessionMapper.toDomain(row) : null;
  }

  async findValidByIdAndCode(sessionId: string, mfaCodeHash: string) {
    const row = await this.dbClient.query.mfaSessions.findFirst({
      where: and(
        eq(mfaSessions.id, sessionId),
        eq(mfaSessions.mfaCodeHash, mfaCodeHash),
        gt(mfaSessions.expiresAt, new Date()),
      ),
    });
    return row ? MfaSessionMapper.toDomain(row) : null;
  }

  async deleteById(sessionId: string) {
    await this.dbClient
      .delete(mfaSessions)
      .where(eq(mfaSessions.id, sessionId));
  }
}

export const mfaSessionRepository = new MfaSessionRepository(db);
