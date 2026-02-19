import type { NextRequest } from 'next/server';

import { EvaluateReadingSchema } from '@/features/reading/application/dto/evaluate-reading.dto';
import { makeEvaluateReadingUseCase } from '@/features/reading/application/factories/evaluate-reading.factory';
import { EvaluateReadingPresenter } from '@/features/reading/infrastructure/presenters/evaluate-reading.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import {
  BadRequestError,
  RateLimitExceededError,
  UnauthorizedError,
} from '@/shared/lib/errors';
import { checkRateLimit } from '@/shared/lib/reading/rate-limit';

import { getReadingAuthUser } from '../get-auth-user';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const { allowed } = await checkRateLimit('rl', user.id, 'evaluate');
    if (!allowed) {
      throw new RateLimitExceededError(
        'Too many requests. Try again later.',
        'reading.api.tooManyRequests',
      );
    }

    const formData = await req.formData();
    const audio = formData.get('audio') as Blob | null;
    const textId = formData.get('textId') as string | null;
    if (!audio || !textId) {
      throw new BadRequestError(
        'Missing audio or textId.',
        'reading.api.missingAudioOrTextId',
      );
    }

    const dto = EvaluateReadingSchema.parse({ textId, audio });
    const useCase = makeEvaluateReadingUseCase();
    const result = await useCase.execute(user.id, dto);

    const duration = Date.now() - startTime;
    console.info(`[Evaluation] Completed in ${duration}ms for user ${user.id}`);

    return EvaluateReadingPresenter.success(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Evaluation] Failed after ${duration}ms:`, error);
    return apiErrorHandler(error, req);
  }
}
