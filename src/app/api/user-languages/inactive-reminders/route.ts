import type { NextRequest } from 'next/server';

import { getUserLanguagesAuthUser } from '@/app/api/user-languages/get-auth-user';
import { makeGetInactiveLanguageRemindersUseCase } from '@/features/user-languages/application/factories/get-inactive-reminders.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getUserLanguagesAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'userLanguages.notAuthenticated',
      );
    }
    const useCase = makeGetInactiveLanguageRemindersUseCase();
    const reminders = await useCase.execute(user.id);
    return Response.json({ reminders });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
