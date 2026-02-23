import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { RequestPaymentLinkSchema } from '@/features/subscriptions/application/dto/request-payment-link.dto';
import { makeRequestPaymentLinkUseCase } from '@/features/subscriptions/application/factories/request-payment-link.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';
import { getLocaleFromRequest } from '@/shared/lib/translate-api-message';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const body = await req.json();
    const dto = RequestPaymentLinkSchema.parse(body);
    const requestLocale = getLocaleFromRequest(req);
    await makeRequestPaymentLinkUseCase().execute(dto, requestLocale);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
