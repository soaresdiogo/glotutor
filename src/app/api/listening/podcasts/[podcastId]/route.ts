import type { NextRequest } from 'next/server';

import { makeGetPodcastDetailUseCase } from '@/features/listening/application/factories/get-podcast-detail.factory';
import { PodcastDetailPresenter } from '@/features/listening/infrastructure/presenters/podcast-detail.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getListeningAuthUser } from '../../get-auth-user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ podcastId: string }> },
) {
  try {
    const user = await getListeningAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'listening.api.notAuthenticated',
      );
    }
    const { podcastId } = await params;
    const useCase = makeGetPodcastDetailUseCase();
    const detail = await useCase.execute(user.id, podcastId);
    return PodcastDetailPresenter.success(detail);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
