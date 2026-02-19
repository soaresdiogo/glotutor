import { NextResponse } from 'next/server';

/**
 * Placeholder so Next.js resolves the exercises segment.
 * Use POST .../exercises/submit and GET .../exercises/results instead.
 */
export function GET() {
  return NextResponse.json(
    { error: 'Use GET .../exercises/results for results' },
    { status: 404 },
  );
}

export function POST() {
  return NextResponse.json(
    { error: 'Use POST .../exercises/submit to submit answers' },
    { status: 404 },
  );
}
