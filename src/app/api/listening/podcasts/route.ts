import type { NextRequest } from 'next/server';

import { makeGetPodcastListUseCase } from '@/features/listening/application/factories/get-podcast-list.factory';
import { PodcastListPresenter } from '@/features/listening/infrastructure/presenters/podcast-list.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getListeningAuthUser } from '../get-auth-user';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getListeningAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'listening.api.notAuthenticated',
      );
    }
    const useCase = makeGetPodcastListUseCase();
    const podcasts = await useCase.execute(user.id);
    return PodcastListPresenter.success(podcasts);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
