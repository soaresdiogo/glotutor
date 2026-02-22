import type { NextRequest } from 'next/server';

import { SaveSessionFeedbackSchema } from '@/features/reading/application/dto/save-session-feedback.dto';
import { makeSaveSessionFeedbackUseCase } from '@/features/reading/application/factories/save-session-feedback.factory';
import { SaveSessionFeedbackPresenter } from '@/features/reading/infrastructure/presenters/save-session-feedback.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getReadingAuthUser } from '../../get-auth-user';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    await getTenantFromRequest(req);
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
    const parsed = SaveSessionFeedbackSchema.safeParse({ sessionId, ...body });
    if (!parsed.success) {
      throw new BadRequestError('Invalid payload.');
    }

    const useCase = makeSaveSessionFeedbackUseCase();
    await useCase.execute(user.id, parsed.data);
    return SaveSessionFeedbackPresenter.success();
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
