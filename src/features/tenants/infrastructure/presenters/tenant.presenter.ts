import type { TenantDto } from '@/features/tenants/application/dto/tenant.dto';
import type { TenantEntity } from '@/features/tenants/domain/entities/tenant.entity';

export const TenantPresenter = {
  toDto(entity: TenantEntity): TenantDto {
    return {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      domain: entity.domain,
      logoUrl: entity.logoUrl,
      status: entity.status,
      plan: entity.plan,
    };
  },
};
