import { serialize } from 'cookie';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { makeDeleteAccountUseCase } from '@/features/auth/application/factories/delete-account.factory';
import { makeGetCurrentUserUseCase } from '@/features/auth/application/factories/get-current-user.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';
import {
  getLocaleFromRequest,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'auth.notAuthenticated',
      );
    }
    const getCurrentUserUseCase = makeGetCurrentUserUseCase();
    const user = await getCurrentUserUseCase.execute(refreshToken);

    const deleteAccountUseCase = makeDeleteAccountUseCase();
    await deleteAccountUseCase.execute(user.id);

    const cookie = serialize('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    const locale = getLocaleFromRequest(req);
    const message = translateApiMessage(locale, 'profile.deleteAccountSuccess');
    const response = NextResponse.json({ message }, { status: 200 });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
