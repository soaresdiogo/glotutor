import type { NextRequest } from 'next/server';
import { makeGetCurrentUserUseCase } from '@/features/auth/application/factories/get-current-user.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return apiErrorHandler(
        new UnauthorizedError('Not authenticated.', 'auth.notAuthenticated'),
        req,
      );
    }

    const getCurrentUserUseCase = makeGetCurrentUserUseCase();
    const user = await getCurrentUserUseCase.execute(refreshToken);

    return Response.json(user);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
