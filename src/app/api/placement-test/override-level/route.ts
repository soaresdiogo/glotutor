import type { NextRequest } from 'next/server';

import { getPlacementTestAuthUser } from '@/app/api/placement-test/get-auth-user';
import { makeOverridePlacementLevelUseCase } from '@/features/placement-test/application/factories/override-placement-level.factory';
import { PlacementPresenter } from '@/features/placement-test/infrastructure/presenters/placement.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
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
    const selectedLevel =
      typeof body?.selectedLevel === 'string' ? body.selectedLevel.trim() : '';

    if (!attemptId || !selectedLevel) {
      return Response.json(
        { message: 'attemptId and selectedLevel are required' },
        { status: 400 },
      );
    }

    const useCase = makeOverridePlacementLevelUseCase();
    const result = await useCase.execute(user.id, attemptId, selectedLevel);
    const response = PlacementPresenter.toOverrideResponse(
      result.attemptId,
      result.selectedLevel,
    );

    return Response.json(response);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
