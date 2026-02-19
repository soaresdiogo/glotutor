import type { NextRequest } from 'next/server';

import { ListSpeakingTopicsSchema } from '@/features/speaking/application/dto/list-speaking-topics.dto';
import { makeListSpeakingTopicsUseCase } from '@/features/speaking/application/factories/list-speaking-topics.factory';
import { SpeakingTopicsPresenter } from '@/features/speaking/infrastructure/presenters/speaking-topics.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getSpeakingAuthUser } from '../get-auth-user';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const level = req.nextUrl.searchParams.get('level') ?? undefined;
    const language = req.nextUrl.searchParams.get('language') ?? undefined;
    const parsed = ListSpeakingTopicsSchema.safeParse({ level, language });

    const useCase = makeListSpeakingTopicsUseCase();
    const topics = await useCase.execute(
      user.id,
      parsed.success ? parsed.data : {},
    );
    return SpeakingTopicsPresenter.success(topics);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
