import type { NextRequest } from 'next/server';

import { makeGetSpeakingTopicUseCase } from '@/features/speaking/application/factories/get-speaking-topic.factory';
import { SpeakingTopicDetailPresenter } from '@/features/speaking/infrastructure/presenters/speaking-topic-detail.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';

import { getSpeakingAuthUser } from '../../get-auth-user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const { slug } = await params;
    if (!slug) {
      throw new BadRequestError('Missing slug.', 'speaking.api.missingSlug');
    }

    const useCase = makeGetSpeakingTopicUseCase();
    const topic = await useCase.execute(user.id, slug);
    return SpeakingTopicDetailPresenter.success(topic);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
