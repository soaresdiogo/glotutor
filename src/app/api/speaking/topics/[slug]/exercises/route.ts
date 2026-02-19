import type { NextRequest } from 'next/server';

import { makeGetTopicExercisesUseCase } from '@/features/speaking/application/factories/get-topic-exercises.factory';
import { SpeakingExercisesPresenter } from '@/features/speaking/infrastructure/presenters/speaking-exercises.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getSpeakingAuthUser } from '../../../get-auth-user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await getTenantFromRequest(req);
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const { slug } = await params;
    if (!slug) {
      throw new BadRequestError(
        'Missing topic identifier.',
        'speaking.api.missingTopicId',
      );
    }

    const useCase = makeGetTopicExercisesUseCase();
    const exercises = await useCase.execute(user.id, slug);
    return SpeakingExercisesPresenter.success(exercises);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
