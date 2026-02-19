import type { NextRequest } from 'next/server';

import { makeGetReadingFeedbackUseCase } from '@/features/reading/application/factories/get-reading-feedback.factory';
import { GetFeedbackPresenter } from '@/features/reading/infrastructure/presenters/get-feedback.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { RateLimitExceededError, UnauthorizedError } from '@/shared/lib/errors';
import { checkRateLimit } from '@/shared/lib/reading/rate-limit';

import { getReadingAuthUser } from '../get-auth-user';

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

    const { allowed } = await checkRateLimit('rl', user.id, 'feedback');
    if (!allowed) {
      throw new RateLimitExceededError(
        'Too many requests. Try again later.',
        'reading.api.tooManyRequests',
      );
    }

    const body = await req.json();
    const dto = {
      wordScores: (body.wordScores ?? []) as Array<{
        status: string;
        expected?: string;
      }>,
      wpm: typeof body.wpm === 'number' ? body.wpm : 0,
      level: (body.level as string) ?? 'A1',
      greenCount: typeof body.greenCount === 'number' ? body.greenCount : 0,
      yellowCount: typeof body.yellowCount === 'number' ? body.yellowCount : 0,
      redCount: typeof body.redCount === 'number' ? body.redCount : 0,
      missedCount: typeof body.missedCount === 'number' ? body.missedCount : 0,
    };

    const useCase = makeGetReadingFeedbackUseCase();
    const result = await useCase.execute(dto);

    const duration = Date.now() - startTime;
    console.info(
      `[Reading][FeedbackRoute] Completed in ${duration}ms for user ${user.id}`,
    );

    return GetFeedbackPresenter.success(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[Reading][FeedbackRoute] Failed after ${duration}ms:`,
      error,
    );
    return apiErrorHandler(error, req);
  }
}
