import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { makeCheckSubscriptionAvailabilityUseCase } from '@/features/subscriptions/application/factories/check-subscription-availability.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantFromRequest(req);
    const plan = req.nextUrl.searchParams.get('plan') ?? undefined;
    const currency = req.nextUrl.searchParams.get('currency') ?? undefined;
    const intervalParam = req.nextUrl.searchParams.get('interval') ?? undefined;
    const interval =
      intervalParam === 'month' || intervalParam === 'annual'
        ? intervalParam
        : undefined;

    const result = await makeCheckSubscriptionAvailabilityUseCase().execute(
      tenant.id,
      {
        planType: plan ?? null,
        currency: currency ?? null,
        interval: interval ?? null,
      },
    );
    return NextResponse.json({
      available: result.available,
      planFound: result.planFound,
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
