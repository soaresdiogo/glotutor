import type { NextRequest } from 'next/server';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantFromRequest(req);
    return Response.json(tenant);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
