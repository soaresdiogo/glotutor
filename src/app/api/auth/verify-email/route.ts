import type { NextRequest } from 'next/server';
import { makeVerifyEmailUseCase } from '@/features/auth/application/factories/verify-email.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError } from '@/shared/lib/errors';
import {
  getLocaleFromRequest,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token || typeof token !== 'string') {
      throw new BadRequestError(
        'Missing or invalid token.',
        'auth.invalidOrExpiredVerificationLink',
      );
    }
    const verifyEmailUseCase = makeVerifyEmailUseCase();
    await verifyEmailUseCase.execute(token);
    const locale = getLocaleFromRequest(req);
    const message = translateApiMessage(
      locale,
      'auth.emailVerifiedSuccessfully',
    );
    return Response.json({ message }, { status: 200 });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
