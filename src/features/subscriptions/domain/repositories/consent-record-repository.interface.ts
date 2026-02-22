export type CreateConsentRecordInput = {
  userId: string;
  consentType: string;
  version: string;
  granted: boolean;
  grantedAt: Date;
};

export interface IConsentRecordRepository {
  create(data: CreateConsentRecordInput): Promise<void>;
}
