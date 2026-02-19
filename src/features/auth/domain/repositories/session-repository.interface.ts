export type SessionEntity = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  deviceInfo: string | null;
  ipAddress: string | null;
};

export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
};

export interface ISessionRepository {
  create(data: CreateSessionInput): Promise<SessionEntity>;
  findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionEntity | null>;
  deleteById(sessionId: string): Promise<void>;
}
