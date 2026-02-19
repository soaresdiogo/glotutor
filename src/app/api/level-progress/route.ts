import type { NextRequest } from 'next/server';

import { getLevelProgressAuthUser } from '@/app/api/level-progress/get-auth-user';
import { makeGetLevelProgressUseCase } from '@/features/level-progress/application/factories/get-level-progress.factory';
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
    const useCase = makeGetLevelProgressUseCase();
    const progress = await useCase.execute(user.id, language);
    return Response.json({
      ...progress,
      certifiedAt: progress.certifiedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
