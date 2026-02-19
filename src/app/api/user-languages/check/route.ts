import type { NextRequest } from 'next/server';

import { getUserLanguagesAuthUser } from '@/app/api/user-languages/get-auth-user';
import { makeCheckUserHasLanguagesUseCase } from '@/features/user-languages/application/factories/check-user-has-languages.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getUserLanguagesAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'userLanguages.notAuthenticated',
      );
    }
    const useCase = makeCheckUserHasLanguagesUseCase();
    const hasLanguages = await useCase.execute(user.id);
    return Response.json({ hasLanguages });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
