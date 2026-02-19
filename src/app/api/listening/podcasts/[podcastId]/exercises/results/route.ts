import type { NextRequest } from 'next/server';

import { makeGetExerciseResultsUseCase } from '@/features/listening/application/factories/get-exercise-results.factory';
import { ExerciseResultsPresenter } from '@/features/listening/infrastructure/presenters/exercise-results.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getListeningAuthUser } from '../../../../get-auth-user';

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
    const useCase = makeGetExerciseResultsUseCase();
    const results = await useCase.execute(user.id, podcastId);
    return ExerciseResultsPresenter.resultsSuccess(results);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
