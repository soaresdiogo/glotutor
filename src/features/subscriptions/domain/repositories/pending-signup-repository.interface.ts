export type CreatePendingSignupInput = {
  email: string;
  passwordHash: string;
  fullName: string | null;
  planType: string;
  expiresAt: Date;
  /** When the user accepted the privacy policy (mandatory for signup). */
  privacyPolicyAcceptedAt: Date;
};

export type PendingSignupRecord = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  planType: string;
  expiresAt: Date;
  privacyPolicyAcceptedAt: Date | null;
};

export interface IPendingSignupRepository {
  upsert(data: CreatePendingSignupInput): Promise<void>;
  findValidByEmail(email: string): Promise<PendingSignupRecord | null>;
  deleteByEmail(email: string): Promise<void>;
}
