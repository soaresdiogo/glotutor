import type { NextRequest } from 'next/server';

import { makeGetSessionResultsUseCase } from '@/features/speaking/application/factories/get-session-results.factory';
import { SpeakingResultsPresenter } from '@/features/speaking/infrastructure/presenters/speaking-results.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';

import { getSpeakingAuthUser } from '../../../get-auth-user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const { sessionId } = await params;
    if (!sessionId) {
      throw new BadRequestError(
        'Missing sessionId.',
        'speaking.api.missingSessionId',
      );
    }

    const useCase = makeGetSessionResultsUseCase();
    const results = await useCase.execute(user.id, sessionId);
    if (!results) {
      return new Response(JSON.stringify({ message: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return SpeakingResultsPresenter.success(results);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
