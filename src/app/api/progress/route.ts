import type { NextRequest } from 'next/server';

import { getReadingAuthUser } from '@/app/api/reading/get-auth-user';
import { makeGetProgressUseCase } from '@/features/progress/application/factories/get-progress.factory';
import { ProgressPresenter } from '@/features/progress/infrastructure/presenters/progress.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'progress.api.notAuthenticated',
      );
    }

    const getProgressUseCase = makeGetProgressUseCase();
    const result = await getProgressUseCase.execute(user.id);
    const body = ProgressPresenter.toResponse(result);

    return Response.json(body);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
