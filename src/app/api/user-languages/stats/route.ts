import type { NextRequest } from 'next/server';

import { getUserLanguagesAuthUser } from '@/app/api/user-languages/get-auth-user';
import { makeGetLanguageStudyStatsUseCase } from '@/features/user-languages/application/factories/get-language-study-stats.factory';
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
    const useCase = makeGetLanguageStudyStatsUseCase();
    const stats = await useCase.execute(user.id);
    return Response.json({ stats });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
