import type { MfaSessionEntity } from '../entities/mfa-session.entity';

export type CreateMfaSessionInput = {
  userId: string;
  mfaCodeHash: string;
  expiresAt: Date;
};

export interface IMfaSessionRepository {
  create(data: CreateMfaSessionInput): Promise<MfaSessionEntity>;
  findById(sessionId: string): Promise<MfaSessionEntity | null>;
  findValidByIdAndCode(
    sessionId: string,
    mfaCodeHash: string,
  ): Promise<MfaSessionEntity | null>;
  deleteById(sessionId: string): Promise<void>;
}
