import type { UserEntity } from '../entities/user.entity';

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  name?: string | null;
  tenantId?: string | null;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(userId: string): Promise<UserEntity | null>;
  create(data: CreateUserInput): Promise<UserEntity>;
  updateLastLoginAt(userId: string): Promise<void>;
  updateEmailVerified(userId: string, verified: boolean): Promise<void>;
  updateStatus(userId: string, status: string): Promise<void>;
  setDeletedAt(userId: string, deletedAt: Date | null): Promise<void>;
  setDeletionRequestedAt(userId: string, at: Date): Promise<void>;
  /** Sets deletedAt for user who had already requested deletion (e.g. when subscription period ends). */
  setDeletedAtIfDeletionRequested(userId: string): Promise<boolean>;
  /** Returns user ids with deletedAt set and older than the given date (for purge). */
  findDeletedBefore(before: Date): Promise<string[]>;
  /** Anonymize PII for LGPD/GDPR (email, name, passwordHash). */
  anonymizeUser(userId: string): Promise<void>;
}
