import type { MfaSessionEntity } from '@/features/auth/domain/entities/mfa-session.entity';
import type { mfaSessions } from '@/infrastructure/db/schema/mfa-sessions';

type MfaSessionRow = typeof mfaSessions.$inferSelect;

export const MfaSessionMapper = {
  toDomain(row: MfaSessionRow): MfaSessionEntity {
    return {
      sessionId: row.id,
      userId: row.userId,
      mfaCodeHash: row.mfaCodeHash,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    };
  },
};
