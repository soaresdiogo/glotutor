import type { NextRequest } from 'next/server';
import { env } from '@/env';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';
import { getSpeakingSessionLimitStatus } from '@/shared/lib/speaking-rate-limit';

import { getSpeakingAuthUser } from '../../get-auth-user';

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
    const dailyLimit = env.SPEAKING_DAILY_SESSION_LIMIT ?? 5;
    const status = await getSpeakingSessionLimitStatus(user.id, dailyLimit);
    return Response.json(status);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
