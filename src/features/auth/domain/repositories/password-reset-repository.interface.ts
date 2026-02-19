export type PasswordResetRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  used: boolean;
  expiresAt: Date;
};

export type CreatePasswordResetInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export interface IPasswordResetRepository {
  create(data: CreatePasswordResetInput): Promise<PasswordResetRecord>;
  findActiveByTokenHash(tokenHash: string): Promise<PasswordResetRecord | null>;
  markAsUsed(id: string): Promise<void>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
}
