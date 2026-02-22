import type { NextRequest } from 'next/server';

import { makeSendSpeakingMessageUseCase } from '@/features/speaking/application/factories/send-speaking-message.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getSpeakingAuthUser } from '../get-auth-user';

type ParsedPayload = {
  sessionId: string;
  isStart: boolean;
  audioBuffer: Buffer | undefined;
  mimeType: string | undefined;
};

async function parseMessagePayload(req: NextRequest): Promise<ParsedPayload> {
  const contentType = req.headers.get('content-type') ?? '';
  const result: ParsedPayload = {
    sessionId: '',
    isStart: false,
    audioBuffer: undefined,
    mimeType: undefined,
  };

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const sid = formData.get('sessionId');
    result.sessionId = typeof sid === 'string' ? sid : '';
    const audio = formData.get('audio');
    if (audio instanceof File) {
      result.audioBuffer = Buffer.from(await audio.arrayBuffer());
      result.mimeType = audio.type || 'audio/webm';
    }
    return result;
  }

  const body = await req.json();
  result.sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
  result.isStart = Boolean(body?.isStart);
  return result;
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const payload = await parseMessagePayload(req);

    if (!payload.sessionId) {
      return jsonResponse({ error: 'sessionId is required' }, 400);
    }

    if (!payload.isStart && (!payload.audioBuffer || !payload.mimeType)) {
      return jsonResponse(
        { error: 'audio is required when isStart is not true' },
        400,
      );
    }

    const useCase = makeSendSpeakingMessageUseCase();
    const result = await useCase.execute({
      userId: user.id,
      sessionId: payload.sessionId,
      isStart: payload.isStart,
      audioBuffer: payload.audioBuffer,
      mimeType: payload.mimeType,
    });

    return jsonResponse(result, 200);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
