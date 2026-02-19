import type { NextRequest } from 'next/server';

import { SubmitExerciseAttemptSchema } from '@/features/speaking/application/dto/submit-exercise-attempt.dto';
import { makeSubmitExerciseAttemptUseCase } from '@/features/speaking/application/factories/submit-exercise-attempt.factory';
import { SpeakingAttemptPresenter } from '@/features/speaking/infrastructure/presenters/speaking-attempt.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';

import { getSpeakingAuthUser } from '../../get-auth-user';

export async function POST(req: NextRequest) {
  try {
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const body = await req.json();
    const parsed = SubmitExerciseAttemptSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestError(
        'Invalid payload. sessionId, exerciseId, answer required.',
        'speaking.api.invalidPayload',
      );
    }

    const useCase = makeSubmitExerciseAttemptUseCase();
    const { attempt, correct, hint } = await useCase.execute(
      user.id,
      parsed.data,
    );
    return SpeakingAttemptPresenter.success({
      correct,
      attemptId: attempt.id,
      hint,
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
