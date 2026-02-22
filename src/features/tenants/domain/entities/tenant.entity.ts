export type TenantEntity = {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
  theme: unknown;
  settings: unknown;
  status: string;
  plan: string;
  ownerUserId: string | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
