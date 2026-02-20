import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/env';
import { makeCreateCheckoutFromLinkUseCase } from '@/features/subscriptions/application/factories/create-checkout-from-link.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantFromRequest(req);
    const body = (await req.json()) as { token?: unknown };
    const token =
      typeof body?.token === 'string' && body.token.length > 0
        ? body.token
        : null;
    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 },
      );
    }
    const appUrl = env.NEXT_PUBLIC_APP_URL;
    const successUrl = `${appUrl}/payment-complete?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/login`;
    const result = await makeCreateCheckoutFromLinkUseCase().execute(token, {
      tenantId: tenant.id,
      successUrl,
      cancelUrl,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
