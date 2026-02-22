import type {
  CreateConsentRecordInput,
  IConsentRecordRepository,
} from '@/features/subscriptions/domain/repositories/consent-record-repository.interface';
import { consentRecords } from '@/infrastructure/db/schema/consent-records';
import type { DbClient } from '@/infrastructure/db/types';

export class ConsentRecordRepository implements IConsentRecordRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreateConsentRecordInput): Promise<void> {
    await this.db.insert(consentRecords).values({
      userId: data.userId,
      consentType: data.consentType,
      version: data.version,
      granted: data.granted,
      grantedAt: data.grantedAt,
    });
  }
}
