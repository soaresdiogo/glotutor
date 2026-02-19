export type MfaSessionEntity = {
  sessionId: string;
  userId: string;
  mfaCodeHash: string;
  expiresAt: Date;
  createdAt: Date;
};
