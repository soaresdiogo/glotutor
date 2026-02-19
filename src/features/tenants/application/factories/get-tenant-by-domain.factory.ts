import type { IGetTenantByDomainUseCase } from '@/features/tenants/application/use-cases/get-tenant-by-domain.use-case';
import { GetTenantByDomainUseCase } from '@/features/tenants/application/use-cases/get-tenant-by-domain.use-case';
import { TenantRepository } from '@/features/tenants/infrastructure/drizzle-repositories/tenant.repository';
import { db } from '@/infrastructure/db/client';

export function makeGetTenantByDomainUseCase(): IGetTenantByDomainUseCase {
  return new GetTenantByDomainUseCase(new TenantRepository(db));
}
