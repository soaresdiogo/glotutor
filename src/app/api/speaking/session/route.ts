import type { NextRequest } from 'next/server';
import { env } from '@/env';
import { CreateSpeakingSessionSchema } from '@/features/speaking/application/dto/create-speaking-session.dto';
import { makeCreateSpeakingSessionUseCase } from '@/features/speaking/application/factories/create-speaking-session.factory';
import { SpeakingSessionPresenter } from '@/features/speaking/infrastructure/presenters/speaking-session.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import {
  BadRequestError,
  RateLimitExceededError,
  UnauthorizedError,
} from '@/shared/lib/errors';
import { checkSpeakingSessionRateLimit } from '@/shared/lib/speaking-rate-limit';

import { getSpeakingAuthUser } from '../get-auth-user';

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
    const parsed = CreateSpeakingSessionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestError(
        'Invalid payload. topicId required.',
        'speaking.api.invalidPayload',
      );
    }

    const dailyLimit = env.SPEAKING_DAILY_SESSION_LIMIT ?? 5;
    const rateLimit = await checkSpeakingSessionRateLimit(user.id, dailyLimit);
    if (!rateLimit.allowed) {
      throw new RateLimitExceededError(
        "You've reached your daily speaking session limit. Come back tomorrow or upgrade your plan.",
        'speaking.api.rateLimitExceeded',
      );
    }

    const useCase = makeCreateSpeakingSessionUseCase();
    const session = await useCase.execute(user.id, parsed.data);
    return SpeakingSessionPresenter.success(session, {
      remainingSessions: rateLimit.remaining,
      dailyLimit: rateLimit.dailyLimit,
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
