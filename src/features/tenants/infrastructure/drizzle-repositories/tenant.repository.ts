import { eq } from 'drizzle-orm';
import type { TenantEntity } from '@/features/tenants/domain/entities/tenant.entity';
import type { ITenantRepository } from '@/features/tenants/domain/repositories/tenant-repository.interface';
import { TenantMapper } from '@/features/tenants/infrastructure/mappers/tenant.mapper';
import { tenants } from '@/infrastructure/db/schema/tenants';
import type { DbClient } from '@/infrastructure/db/types';

export class TenantRepository implements ITenantRepository {
  constructor(private readonly db: DbClient) {}

  async findByDomain(domain: string): Promise<TenantEntity | null> {
    const normalized = domain.toLowerCase().trim();
    const row = await this.db.query.tenants.findFirst({
      where: eq(tenants.domain, normalized),
    });
    return row ? TenantMapper.toDomain(row) : null;
  }
}
