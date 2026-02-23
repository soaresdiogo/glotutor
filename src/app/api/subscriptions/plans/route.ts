import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { makeListPlansUseCase } from '@/features/subscriptions/application/factories/list-plans.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

/**
 * GET /api/subscriptions/plans
 * Returns all subscription plans for the tenant with every price option
 * (multi-currency, monthly/annual). Useful for building landing links or
 * displaying all options. Checkout is driven by URL params: plan, currency, interval.
 */
export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantFromRequest(req);
    const result = await makeListPlansUseCase().execute(tenant.id);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
