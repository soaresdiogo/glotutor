import type { NextRequest } from 'next/server';

import { makeGetGrammarAnalysisUseCase } from '@/features/reading/application/factories/get-grammar-analysis.factory';
import { GetGrammarAnalysisPresenter } from '@/features/reading/infrastructure/presenters/get-grammar-analysis.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { RateLimitExceededError, UnauthorizedError } from '@/shared/lib/errors';
import { checkRateLimit } from '@/shared/lib/reading/rate-limit';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getReadingAuthUser } from '../get-auth-user';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const { allowed } = await checkRateLimit('rl', user.id, 'grammarAnalysis');
    if (!allowed) {
      throw new RateLimitExceededError(
        'Too many requests. Try again later.',
        'reading.api.tooManyRequests',
      );
    }

    const body = await req.json();
    const dto = {
      textId: body.textId as string | undefined,
      content: body.content as string | undefined,
      level: body.level as string | undefined,
      language: body.language as string | undefined,
    };

    const useCase = makeGetGrammarAnalysisUseCase();
    const result = await useCase.execute(user.id, dto);

    const duration = Date.now() - startTime;
    console.info(
      `[Reading][GrammarRoute] Completed in ${duration}ms for user ${user.id}`,
    );

    return GetGrammarAnalysisPresenter.success(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Reading][GrammarRoute] Failed after ${duration}ms:`, error);
    return apiErrorHandler(error, req);
  }
}
