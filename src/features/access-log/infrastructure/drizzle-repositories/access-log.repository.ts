import type { IAccessLogRepository } from '@/features/access-log/application/use-cases/update-user-access-log.use-case';
import { db } from '@/infrastructure/db/client';
import { loginAttempts } from '@/infrastructure/db/schema/login-attempts';
import type { DbClient } from '@/infrastructure/db/types';

export class AccessLogRepository implements IAccessLogRepository {
  constructor(private readonly dbClient: DbClient) {}

  async create(input: {
    userId: string;
    email: string;
    ipAddress: string | null;
    deviceInfo: string | null;
    status: string;
  }): Promise<void> {
    await this.dbClient.insert(loginAttempts).values({
      userId: input.userId,
      email: input.email,
      ipAddress: input.ipAddress,
      deviceInfo: input.deviceInfo,
      status: input.status,
    });
  }
}

export const accessLogRepository = new AccessLogRepository(db);
