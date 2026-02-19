import type { NextRequest } from 'next/server';

import { makeCompleteSpeakingSessionUseCase } from '@/features/speaking/application/factories/complete-speaking-session.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';

import { getSpeakingAuthUser } from '../../../get-auth-user';

export async function POST(
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

    const useCase = makeCompleteSpeakingSessionUseCase();
    await useCase.execute(user.id, { sessionId });
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
