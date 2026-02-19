import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SubmitSpeakingFeedbackSchema } from '@/features/speaking/application/dto/speaking-feedback.dto';
import { makeGenerateSpeakingFeedbackUseCase } from '@/features/speaking/application/factories/generate-speaking-feedback.factory';
import { makeGetSpeakingFeedbackUseCase } from '@/features/speaking/application/factories/get-speaking-feedback.factory';
import { SpeakingFeedbackPresenter } from '@/features/speaking/infrastructure/presenters/speaking-feedback.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';

import { getSpeakingAuthUser } from '../../../get-auth-user';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const { sessionId } = await params;
    if (!sessionId) {
      throw new BadRequestError(
        'Missing sessionId.',
        'speaking.api.missingSessionId',
      );
    }

    const body = await req.json();
    const parsed = SubmitSpeakingFeedbackSchema.safeParse({
      sessionId,
      transcript: body?.transcript,
    });
    if (!parsed.success) {
      throw new BadRequestError(
        'Invalid payload. transcript required.',
        'speaking.api.invalidPayload',
      );
    }

    const useCase = makeGenerateSpeakingFeedbackUseCase();
    const feedback = await useCase.execute(user.id, parsed.data);
    return SpeakingFeedbackPresenter.success(feedback);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const { sessionId } = await params;
    if (!sessionId) {
      throw new BadRequestError(
        'Missing sessionId.',
        'speaking.api.missingSessionId',
      );
    }

    const useCase = makeGetSpeakingFeedbackUseCase();
    const feedback = await useCase.execute(user.id, sessionId);
    if (!feedback) {
      return NextResponse.json(null, { status: 200 });
    }
    return SpeakingFeedbackPresenter.success(feedback);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
