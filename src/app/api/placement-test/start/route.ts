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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/585dfbd9-11ed-4a7b-8723-960821f4c7ae', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'eff39f',
      },
      body: JSON.stringify({
        sessionId: 'eff39f',
        location: 'placement-test/start/route.ts:body',
        message: 'placement start body',
        data: {
          rawLanguage: body?.language,
          language,
          typeofLanguage: typeof body?.language,
        },
        timestamp: Date.now(),
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
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
    // #region agent log
    const err = error as {
      constructor?: { name?: string };
      statusCode?: number;
      code?: string;
      messageKey?: string;
    };
    fetch('http://127.0.0.1:7244/ingest/585dfbd9-11ed-4a7b-8723-960821f4c7ae', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'eff39f',
      },
      body: JSON.stringify({
        sessionId: 'eff39f',
        location: 'placement-test/start/route.ts:catch',
        message: 'placement start error',
        data: {
          name: err?.constructor?.name,
          statusCode: err?.statusCode,
          code: err?.code,
          messageKey: err?.messageKey,
        },
        timestamp: Date.now(),
        hypothesisId: 'E',
      }),
    }).catch(() => {});
    // #endregion
    return apiErrorHandler(error, req);
  }
}
