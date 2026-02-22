export type TenantDto = {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
  status: string;
  plan: string;
};
