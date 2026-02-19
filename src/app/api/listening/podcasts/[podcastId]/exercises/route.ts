import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

/**
 * Placeholder so Next.js resolves the exercises segment.
 * Use POST .../exercises/submit and GET .../exercises/results instead.
 */
export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
  return NextResponse.json(
    { error: 'Use GET .../exercises/results for results' },
    { status: 404 },
  );
}

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
  return NextResponse.json(
    { error: 'Use POST .../exercises/submit to submit answers' },
    { status: 404 },
  );
}
