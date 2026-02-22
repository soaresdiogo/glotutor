import type { NextRequest } from 'next/server';

import { getUserLanguagesAuthUser } from '@/app/api/user-languages/get-auth-user';
import { makeAddLanguageUseCase } from '@/features/user-languages/application/factories/add-language.factory';
import { makeGetUserLanguagesUseCase } from '@/features/user-languages/application/factories/get-user-languages.factory';
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
    const useCase = makeGetUserLanguagesUseCase();
    const list = await useCase.execute(user.id);
    return Response.json({ languages: list });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getUserLanguagesAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'userLanguages.notAuthenticated',
      );
    }
    const body = await req.json();
    const language =
      typeof body?.language === 'string' ? body.language.trim() : '';
    const placementAttemptId =
      typeof body?.placementAttemptId === 'string'
        ? body.placementAttemptId.trim()
        : undefined;
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

    const useCase = makeAddLanguageUseCase();
    const progress = await useCase.execute(user.id, {
      language,
      placementAttemptId,
      selectedLevel,
    });

    return Response.json({
      id: progress.id,
      language: progress.language,
      currentLevel: progress.currentLevel,
      startedAt: progress.startedAt.toISOString(),
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
