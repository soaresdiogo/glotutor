import type { NextRequest } from 'next/server';
import { makeRefreshAuthTokenUseCase } from '@/features/auth/application/factories/refresh-auth-token.factory';
import { RefreshTokenPresenter } from '@/features/auth/infrastructure/presenters/refresh-token.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return apiErrorHandler(
        new UnauthorizedError(
          'Refresh token is required.',
          'auth.refreshTokenRequired',
        ),
        req,
      );
    }

    const refreshAuthTokenUseCase = makeRefreshAuthTokenUseCase();
    const tokens = await refreshAuthTokenUseCase.execute(refreshToken);

    return RefreshTokenPresenter.success(
      tokens.accessToken,
      tokens.refreshToken,
    );
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
