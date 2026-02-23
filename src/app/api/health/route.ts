import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Healthcheck for Coolify/orchestrators. Returns 200 when the app is up.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
