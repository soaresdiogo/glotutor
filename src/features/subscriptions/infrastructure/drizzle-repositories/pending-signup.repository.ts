import { and, eq, gt } from 'drizzle-orm';
import type {
  CreatePendingSignupInput,
  IPendingSignupRepository,
  PendingSignupRecord,
} from '@/features/subscriptions/domain/repositories/pending-signup-repository.interface';
import { pendingSignups } from '@/infrastructure/db/schema/pending-signups';
import type { DbClient } from '@/infrastructure/db/types';

export class PendingSignupRepository implements IPendingSignupRepository {
  constructor(private readonly db: DbClient) {}

  async upsert(data: CreatePendingSignupInput): Promise<void> {
    await this.db
      .insert(pendingSignups)
      .values({
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        planType: data.planType,
        expiresAt: data.expiresAt,
        privacyPolicyAcceptedAt: data.privacyPolicyAcceptedAt,
        locale: data.locale ?? null,
      })
      .onConflictDoUpdate({
        target: pendingSignups.email,
        set: {
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          planType: data.planType,
          expiresAt: data.expiresAt,
          privacyPolicyAcceptedAt: data.privacyPolicyAcceptedAt,
          locale: data.locale ?? null,
        },
      });
  }

  async findValidByEmail(email: string): Promise<PendingSignupRecord | null> {
    const row = await this.db.query.pendingSignups.findFirst({
      where: and(
        eq(pendingSignups.email, email.toLowerCase()),
        gt(pendingSignups.expiresAt, new Date()),
      ),
    });
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      fullName: row.fullName,
      planType: row.planType,
      expiresAt: row.expiresAt,
      privacyPolicyAcceptedAt: row.privacyPolicyAcceptedAt,
      locale: row.locale ?? null,
    };
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.db
      .delete(pendingSignups)
      .where(eq(pendingSignups.email, email.toLowerCase()));
  }
}
