import type { NextRequest } from 'next/server';

import { getLevelProgressAuthUser } from '@/app/api/level-progress/get-auth-user';
import { makeStartCertificationExamUseCase } from '@/features/level-progress/application/factories/start-certification-exam.factory';
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
    const language =
      typeof body?.language === 'string' ? body.language.trim() : '';
    if (!language) {
      return Response.json(
        { message: 'language is required' },
        { status: 400 },
      );
    }
    const useCase = makeStartCertificationExamUseCase();
    const { exam, question } = await useCase.execute(user.id, language);
    return Response.json({
      examId: exam.id,
      language: exam.language,
      cefrLevel: exam.cefrLevel,
      totalQuestions: exam.totalQuestions,
      question: PlacementPresenter.questionToDto(question),
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
