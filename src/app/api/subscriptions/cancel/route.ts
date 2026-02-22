import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getReadingAuthUser } from '@/app/api/reading/get-auth-user';
import { makeCancelSubscriptionUseCase } from '@/features/subscriptions/application/factories/cancel-subscription.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'profile.api.notAuthenticated',
      );
    }
    const useCase = makeCancelSubscriptionUseCase();
    const result = await useCase.execute(user.id);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
