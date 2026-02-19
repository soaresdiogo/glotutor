import type { NextRequest } from 'next/server';

import { SaveComprehensionAnswersSchema } from '@/features/reading/application/dto/save-comprehension-answers.dto';
import { makeSaveComprehensionAnswersUseCase } from '@/features/reading/application/factories/save-comprehension-answers.factory';
import { SaveComprehensionAnswersPresenter } from '@/features/reading/infrastructure/presenters/save-comprehension-answers.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';

import { getReadingAuthUser } from '../../../get-auth-user';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const { sessionId } = await params;
    if (!sessionId) {
      throw new BadRequestError(
        'Missing session.',
        'reading.api.missingSessionId',
      );
    }

    const body = await req.json();
    const parsed = SaveComprehensionAnswersSchema.safeParse({
      sessionId,
      answers: body.answers ?? {},
    });
    if (!parsed.success) {
      throw new BadRequestError('Invalid payload.');
    }

    const useCase = makeSaveComprehensionAnswersUseCase();
    await useCase.execute(user.id, parsed.data);
    return SaveComprehensionAnswersPresenter.success();
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
