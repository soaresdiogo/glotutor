import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { RequestPaymentLinkSchema } from '@/features/subscriptions/application/dto/request-payment-link.dto';
import { makeRequestPaymentLinkUseCase } from '@/features/subscriptions/application/factories/request-payment-link.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const dto = RequestPaymentLinkSchema.parse(await req.json());
    await makeRequestPaymentLinkUseCase().execute(dto);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
