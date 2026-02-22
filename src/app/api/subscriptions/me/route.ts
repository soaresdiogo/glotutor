import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getReadingAuthUser } from '@/app/api/reading/get-auth-user';
import { makeGetMySubscriptionUseCase } from '@/features/subscriptions/application/factories/get-my-subscription.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export type MySubscriptionResponse = {
  status: string;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** ISO date when subscription will end (trial end or period end). */
  accessUntil: string | null;
};

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'profile.api.notAuthenticated',
      );
    }
    const useCase = makeGetMySubscriptionUseCase();
    const subscription = await useCase.execute(user.id);
    if (!subscription) {
      return NextResponse.json(null);
    }
    const accessUntil = subscription.trialEnd ?? subscription.currentPeriodEnd;
    const body: MySubscriptionResponse = {
      status: subscription.status,
      trialEnd: subscription.trialEnd?.toISOString() ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      accessUntil: accessUntil?.toISOString() ?? null,
    };
    return NextResponse.json(body);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
