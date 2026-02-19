import type { NextRequest } from 'next/server';

import { GetLastSessionSchema } from '@/features/reading/application/dto/get-last-session.dto';
import { makeGetLastSessionUseCase } from '@/features/reading/application/factories/get-last-session.factory';
import { GetLastSessionPresenter } from '@/features/reading/infrastructure/presenters/get-last-session.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getReadingAuthUser } from '../get-auth-user';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const textId = req.nextUrl.searchParams.get('textId');
    const parsed = GetLastSessionSchema.safeParse({ textId });
    if (!parsed.success || !textId) {
      throw new BadRequestError('Missing textId.', 'reading.api.missingTextId');
    }

    const useCase = makeGetLastSessionUseCase();
    const session = await useCase.execute(user.id, parsed.data);
    return GetLastSessionPresenter.success(session);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
