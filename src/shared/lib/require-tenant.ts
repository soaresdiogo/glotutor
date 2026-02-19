import type { NextRequest } from 'next/server';
import type { TenantDto } from '@/features/tenants/application/dto/tenant.dto';
import { makeGetTenantByDomainUseCase } from '@/features/tenants/application/factories/get-tenant-by-domain.factory';
import { TenantPresenter } from '@/features/tenants/infrastructure/presenters/tenant.presenter';
import { TenantNotFoundError } from '@/shared/lib/errors';

export function getDomainFromRequest(req: NextRequest): string {
  const host =
    req.headers.get('host') ?? req.headers.get('x-forwarded-host') ?? '';
  return host.split(':')[0].toLowerCase().trim() || 'localhost';
}

export async function getTenantFromRequest(
  req: NextRequest,
): Promise<TenantDto> {
  const domain = getDomainFromRequest(req);
  const useCase = makeGetTenantByDomainUseCase();
  const tenant = await useCase.execute(domain);
  if (!tenant) {
    throw new TenantNotFoundError(
      'No tenant configured for this domain.',
      'tenant.notFound',
    );
  }
  return TenantPresenter.toDto(tenant);
}
