import type { NextRequest } from 'next/server';

import { makeGetReadingTextDetailUseCase } from '@/features/reading/application/factories/get-reading-text-detail.factory';
import { GetReadingTextDetailPresenter } from '@/features/reading/infrastructure/presenters/get-reading-text-detail.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getReadingAuthUser } from '../../get-auth-user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const { id } = await params;
    const useCase = makeGetReadingTextDetailUseCase();
    const detail = await useCase.execute(user.id, id);
    return GetReadingTextDetailPresenter.success(detail);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
