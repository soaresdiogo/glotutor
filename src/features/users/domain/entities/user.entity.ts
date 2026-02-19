export type UserEntity = {
  userId: string;
  tenantId: string | null;
  accountId: string | null;
  email: string;
  passwordHash: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  status: string;
  lastLoginAt: Date | null;
};
