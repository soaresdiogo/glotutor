import type { NextRequest } from 'next/server';

import { getPlacementTestAuthUser } from '@/app/api/placement-test/get-auth-user';
import { makeAnswerPlacementQuestionUseCase } from '@/features/placement-test/application/factories/answer-placement-question.factory';
import { PlacementPresenter } from '@/features/placement-test/infrastructure/presenters/placement.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const user = await getPlacementTestAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'placementTest.notAuthenticated',
      );
    }

    const body = await req.json();
    const attemptId =
      typeof body?.attemptId === 'string' ? body.attemptId.trim() : '';
    const questionId =
      typeof body?.questionId === 'string' ? body.questionId.trim() : '';
    const selectedOptionIndex =
      typeof body?.selectedOptionIndex === 'number'
        ? body.selectedOptionIndex
        : undefined;

    if (!attemptId || !questionId || selectedOptionIndex === undefined) {
      return Response.json(
        {
          message: 'attemptId, questionId and selectedOptionIndex are required',
        },
        { status: 400 },
      );
    }

    const useCase = makeAnswerPlacementQuestionUseCase();
    const result = await useCase.execute(
      user.id,
      attemptId,
      questionId,
      selectedOptionIndex,
    );
    const response = PlacementPresenter.toAnswerResponse(result);

    return Response.json(response);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
