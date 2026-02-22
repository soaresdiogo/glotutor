import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
  return NextResponse.json(
    { message: 'Change password is not implemented yet.' },
    { status: 501 },
  );
}
