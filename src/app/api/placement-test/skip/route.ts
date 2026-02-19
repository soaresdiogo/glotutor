import type { NextRequest } from 'next/server';

import { getPlacementTestAuthUser } from '@/app/api/placement-test/get-auth-user';
import { makeSkipPlacementTestUseCase } from '@/features/placement-test/application/factories/skip-placement-test.factory';
import { PlacementPresenter } from '@/features/placement-test/infrastructure/presenters/placement.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const user = await getPlacementTestAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'placementTest.notAuthenticated',
      );
    }

    const body = await req.json();
    const language =
      typeof body?.language === 'string' ? body.language.trim() : '';
    const selectedLevel =
      typeof body?.selectedLevel === 'string'
        ? body.selectedLevel.trim()
        : undefined;

    if (!language) {
      return Response.json(
        { message: 'language is required' },
        { status: 400 },
      );
    }

    const useCase = makeSkipPlacementTestUseCase();
    const attempt = await useCase.execute(user.id, language, selectedLevel);
    const response = PlacementPresenter.toSkipResponse(attempt);

    return Response.json(response);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
