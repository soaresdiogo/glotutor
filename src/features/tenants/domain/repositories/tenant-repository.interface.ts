import type { TenantEntity } from '../entities/tenant.entity';

export interface ITenantRepository {
  findByDomain(domain: string): Promise<TenantEntity | null>;
}
