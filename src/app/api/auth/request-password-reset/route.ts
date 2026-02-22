import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { RequestPasswordResetSchema } from '@/features/auth/application/dto/request-password-reset.dto';
import { makeRequestPasswordResetUseCase } from '@/features/auth/application/factories/request-password-reset.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';
import {
  getLocaleFromRequest,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const { email } = RequestPasswordResetSchema.parse(await req.json());
    const requestPasswordResetUseCase = makeRequestPasswordResetUseCase();
    await requestPasswordResetUseCase.execute(email);
    const message = translateApiMessage(
      getLocaleFromRequest(req),
      'auth.passwordResetLinkSent',
    );
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
