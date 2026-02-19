export type EmailVerificationRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  type: string;
  used: boolean;
  expiresAt: Date;
};

export type CreateEmailVerificationInput = {
  userId: string;
  tokenHash: string;
  type: string;
  expiresAt: Date;
};

export interface IEmailVerificationRepository {
  create(data: CreateEmailVerificationInput): Promise<EmailVerificationRecord>;
  findActiveByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationRecord | null>;
  markAsUsed(id: string): Promise<void>;
}
