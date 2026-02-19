import { eq } from 'drizzle-orm';
import type {
  CreateSessionInput,
  ISessionRepository,
  SessionEntity,
} from '@/features/auth/domain/repositories/session-repository.interface';
import { db } from '@/infrastructure/db/client';
import { sessions } from '@/infrastructure/db/schema/sessions';
import type { DbClient } from '@/infrastructure/db/types';

export class SessionRepository implements ISessionRepository {
  constructor(private readonly dbClient: DbClient) {}

  async create(data: CreateSessionInput): Promise<SessionEntity> {
    const [row] = await this.dbClient
      .insert(sessions)
      .values({
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        deviceInfo: data.deviceInfo ?? null,
        ipAddress: data.ipAddress ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create session');
    return {
      id: row.id,
      userId: row.userId,
      refreshTokenHash: row.refreshTokenHash,
      expiresAt: row.expiresAt,
      deviceInfo: row.deviceInfo,
      ipAddress: row.ipAddress,
    };
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionEntity | null> {
    const row = await this.dbClient.query.sessions.findFirst({
      where: eq(sessions.refreshTokenHash, refreshTokenHash),
    });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      refreshTokenHash: row.refreshTokenHash,
      expiresAt: row.expiresAt,
      deviceInfo: row.deviceInfo,
      ipAddress: row.ipAddress,
    };
  }

  async deleteById(sessionId: string): Promise<void> {
    await this.dbClient.delete(sessions).where(eq(sessions.id, sessionId));
  }
}

export const sessionRepository = new SessionRepository(db);
