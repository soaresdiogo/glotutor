import type { NextRequest } from 'next/server';

import { getUserLanguagesAuthUser } from '@/app/api/user-languages/get-auth-user';
import { makeSetPrimaryLanguageUseCase } from '@/features/user-languages/application/factories/set-primary-language.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

export async function POST(req: NextRequest) {
  try {
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
    if (!language) {
      return Response.json(
        { message: 'language is required' },
        { status: 400 },
      );
    }
    const useCase = makeSetPrimaryLanguageUseCase();
    const result = await useCase.execute(user.id, language);
    return Response.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
