import type { NextRequest } from 'next/server';

import { makeGetPronunciationUseCase } from '@/features/reading/application/factories/get-pronunciation.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import {
  BadRequestError,
  RateLimitExceededError,
  UnauthorizedError,
} from '@/shared/lib/errors';
import { checkRateLimit } from '@/shared/lib/reading/rate-limit';

import { getReadingAuthUser } from '../get-auth-user';

export async function POST(req: NextRequest) {
  try {
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const { allowed } = await checkRateLimit('rl', user.id, 'pronunciation');
    if (!allowed) {
      throw new RateLimitExceededError(
        'Too many requests. Try again later.',
        'reading.api.tooManyRequests',
      );
    }

    const body = await req.json();
    const word = typeof body.word === 'string' ? body.word.trim() : '';
    const language = typeof body.language === 'string' ? body.language : 'en';
    const languageCode = language.split('-')[0];

    if (!word) {
      throw new BadRequestError('Missing word.', 'reading.api.missingWord');
    }

    const useCase = makeGetPronunciationUseCase();
    const result = await useCase.execute(user.id, word, languageCode);
    return Response.json({ audioUrl: result.audioUrl });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
