import type { NextRequest } from 'next/server';

import { getReadingAuthUser } from '@/app/api/reading/get-auth-user';
import { makeGetProgressUseCase } from '@/features/progress/application/factories/get-progress.factory';
import { ProgressPresenter } from '@/features/progress/infrastructure/presenters/progress.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'progress.api.notAuthenticated',
      );
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') ?? undefined;

    const getProgressUseCase = makeGetProgressUseCase();
    const result = await getProgressUseCase.execute(user.id, language);
    const body = ProgressPresenter.toResponse(result);

    return Response.json(body);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
