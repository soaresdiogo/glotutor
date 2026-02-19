import type { NextRequest } from 'next/server';

import { getLevelProgressAuthUser } from '@/app/api/level-progress/get-auth-user';
import { makeCheckCertificationEligibilityUseCase } from '@/features/level-progress/application/factories/check-certification-eligibility.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getLevelProgressAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'levelProgress.notAuthenticated',
      );
    }
    const language = req.nextUrl.searchParams.get('language') ?? '';
    if (!language) {
      return Response.json(
        { message: 'language query is required' },
        { status: 400 },
      );
    }
    const useCase = makeCheckCertificationEligibilityUseCase();
    const result = await useCase.execute(user.id, language);
    return Response.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
