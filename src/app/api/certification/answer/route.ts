import type { NextRequest } from 'next/server';

import { getLevelProgressAuthUser } from '@/app/api/level-progress/get-auth-user';
import { makeAnswerCertificationQuestionUseCase } from '@/features/level-progress/application/factories/answer-certification-question.factory';
import { PlacementPresenter } from '@/features/placement-test/infrastructure/presenters/placement.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const user = await getLevelProgressAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'certification.notAuthenticated',
      );
    }
    const body = await req.json();
    const examId = typeof body?.examId === 'string' ? body.examId.trim() : '';
    const questionId =
      typeof body?.questionId === 'string' ? body.questionId.trim() : '';
    const selectedOptionIndex =
      typeof body?.selectedOptionIndex === 'number'
        ? body.selectedOptionIndex
        : undefined;

    if (!examId || !questionId || selectedOptionIndex === undefined) {
      return Response.json(
        {
          message: 'examId, questionId and selectedOptionIndex are required',
        },
        { status: 400 },
      );
    }

    const useCase = makeAnswerCertificationQuestionUseCase();
    const result = await useCase.execute(
      user.id,
      examId,
      questionId,
      selectedOptionIndex,
    );

    if (result.kind === 'next') {
      return Response.json({
        kind: 'next',
        question: PlacementPresenter.questionToDto(result.question),
        questionsAnswered: result.questionsAnswered,
      });
    }

    return Response.json({
      kind: 'result',
      examId: result.examId,
      passed: result.passed,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      nextLevelUnlocked: result.nextLevelUnlocked,
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
