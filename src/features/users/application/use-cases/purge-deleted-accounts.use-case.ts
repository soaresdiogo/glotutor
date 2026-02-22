import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';

/**
 * LGPD/GDPR: Anonymizes PII of users who were deleted more than GRACE_PERIOD_DAYS ago.
 * Run periodically (e.g. daily cron). Keeps deletedAt; removes email, name, avatar, password.
 * See audit_logs (ACCOUNT_DELETION_REQUEST) for traceability.
 */
const GRACE_PERIOD_DAYS = 30;

export interface IPurgeDeletedAccountsUseCase {
  execute(): Promise<{ purgedCount: number }>;
}

export class PurgeDeletedAccountsUseCase
  implements IPurgeDeletedAccountsUseCase
{
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(): Promise<{ purgedCount: number }> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - GRACE_PERIOD_DAYS);

    const userIds = await this.userRepo.findDeletedBefore(cutoff);
    for (const userId of userIds) {
      await this.userRepo.anonymizeUser(userId);
    }
    return { purgedCount: userIds.length };
  }
}
