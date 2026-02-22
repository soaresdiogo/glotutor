import type { NextRequest } from 'next/server';

import { getPlacementTestAuthUser } from '@/app/api/placement-test/get-auth-user';
import { makeStartPlacementTestUseCase } from '@/features/placement-test/application/factories/start-placement-test.factory';
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
    const language =
      typeof body?.language === 'string' ? body.language.trim() : '';
    if (!language) {
      return Response.json(
        { message: 'language is required' },
        { status: 400 },
      );
    }

    const useCase = makeStartPlacementTestUseCase();
    const { attempt, question } = await useCase.execute(user.id, language);
    const response = PlacementPresenter.toStartResponse(attempt, question);

    return Response.json(response);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
