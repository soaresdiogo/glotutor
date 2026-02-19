import type { TenantEntity } from '@/features/tenants/domain/entities/tenant.entity';
import type { tenants } from '@/infrastructure/db/schema/tenants';

type TenantRow = typeof tenants.$inferSelect;

export const TenantMapper = {
  toDomain(row: TenantRow): TenantEntity {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      domain: row.domain,
      logoUrl: row.logoUrl,
      theme: row.theme,
      settings: row.settings,
      status: row.status,
      plan: row.plan,
      ownerUserId: row.ownerUserId,
      trialEndsAt: row.trialEndsAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },
};
