import type { NextRequest } from 'next/server';

import { makeSendSpeakingMessageUseCase } from '@/features/speaking/application/factories/send-speaking-message.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getSpeakingAuthUser } from '../get-auth-user';

export async function POST(req: NextRequest) {
  try {
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const contentType = req.headers.get('content-type') ?? '';
    let sessionId: string;
    let isStart = false;
    let audioBuffer: Buffer | undefined;
    let mimeType: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const sid = formData.get('sessionId');
      sessionId = typeof sid === 'string' ? sid : '';
      const audio = formData.get('audio');
      if (audio instanceof File) {
        const ab = await audio.arrayBuffer();
        audioBuffer = Buffer.from(ab);
        mimeType = audio.type || 'audio/webm';
      }
    } else {
      const body = await req.json();
      sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
      isStart = Boolean(body?.isStart);
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'sessionId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isStart && (!audioBuffer || !mimeType)) {
      return new Response(
        JSON.stringify({ error: 'audio is required when isStart is not true' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const useCase = makeSendSpeakingMessageUseCase();
    const result = await useCase.execute({
      userId: user.id,
      sessionId,
      isStart: isStart || false,
      audioBuffer,
      mimeType,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
