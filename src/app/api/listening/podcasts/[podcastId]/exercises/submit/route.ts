import type { NextRequest } from 'next/server';

import { submitExercisesSchema } from '@/features/listening/application/dto/submit-exercises.dto';
import { makeSubmitExercisesUseCase } from '@/features/listening/application/factories/submit-exercises.factory';
import { ExerciseResultsPresenter } from '@/features/listening/infrastructure/presenters/exercise-results.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getListeningAuthUser } from '../../../../get-auth-user';

export async function POST(
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
    const body = await req.json();
    const parsed = submitExercisesSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorHandler(parsed.error, req);
    }
    const useCase = makeSubmitExercisesUseCase();
    const result = await useCase.execute(user.id, podcastId, parsed.data);
    return ExerciseResultsPresenter.submitSuccess(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
