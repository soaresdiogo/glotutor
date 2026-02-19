import type { NextRequest } from 'next/server';

import { getPlacementTestAuthUser } from '@/app/api/placement-test/get-auth-user';
import { makeCompletePlacementTestUseCase } from '@/features/placement-test/application/factories/complete-placement-test.factory';
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
    const attemptId =
      typeof body?.attemptId === 'string' ? body.attemptId.trim() : '';
    if (!attemptId) {
      return Response.json(
        { message: 'attemptId is required' },
        { status: 400 },
      );
    }

    const useCase = makeCompletePlacementTestUseCase();
    const { attemptId: id, recommendedLevel } = await useCase.execute(
      user.id,
      attemptId,
    );

    const response = PlacementPresenter.toCompleteResponse(
      id,
      recommendedLevel,
      recommendedLevel,
    );

    return Response.json(response);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
