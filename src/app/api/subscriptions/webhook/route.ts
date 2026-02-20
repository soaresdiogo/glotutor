import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { makeProcessWebhookEventUseCase } from '@/features/subscriptions/application/factories/process-webhook-event.factory';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { message: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ message: 'Invalid body' }, { status: 400 });
  }
  try {
    await makeProcessWebhookEventUseCase().execute({ rawBody, signature });
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[Stripe Webhook]', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Webhook handler failed',
      },
      { status: 400 },
    );
  }
}
