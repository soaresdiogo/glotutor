import type { TenantEntity } from '@/features/tenants/domain/entities/tenant.entity';
import type { ITenantRepository } from '@/features/tenants/domain/repositories/tenant-repository.interface';

export interface IGetTenantByDomainUseCase {
  execute(domain: string): Promise<TenantEntity | null>;
}

export class GetTenantByDomainUseCase implements IGetTenantByDomainUseCase {
  constructor(private readonly tenantRepo: ITenantRepository) {}

  async execute(domain: string): Promise<TenantEntity | null> {
    const normalized = domain.toLowerCase().trim();
    if (!normalized) return null;
    return this.tenantRepo.findByDomain(normalized);
  }
}
