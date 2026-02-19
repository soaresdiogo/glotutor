import type { UserEntity } from '../entities/user.entity';

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  name?: string | null;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(userId: string): Promise<UserEntity | null>;
  create(data: CreateUserInput): Promise<UserEntity>;
  updateLastLoginAt(userId: string): Promise<void>;
  updateEmailVerified(userId: string, verified: boolean): Promise<void>;
  updateStatus(userId: string, status: string): Promise<void>;
}
