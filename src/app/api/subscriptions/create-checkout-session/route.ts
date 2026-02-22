import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/env';
import { CreateCheckoutSessionSchema } from '@/features/subscriptions/application/dto/create-checkout-session.dto';
import { makeCreateCheckoutSessionUseCase } from '@/features/subscriptions/application/factories/create-checkout-session.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantFromRequest(req);
    const dto = CreateCheckoutSessionSchema.parse(await req.json());
    const appUrl = env.NEXT_PUBLIC_APP_URL;
    const successUrl = `${appUrl}/payment-complete?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/login`;
    const result = await makeCreateCheckoutSessionUseCase().execute(dto, {
      tenantId: tenant.id,
      successUrl,
      cancelUrl,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
