import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { makeGetCheckoutSessionUseCase } from '@/features/subscriptions/application/factories/get-checkout-session.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 },
      );
    }
    const session = await makeGetCheckoutSessionUseCase().execute(sessionId);
    return NextResponse.json(session);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
