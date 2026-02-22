import type { NextRequest } from 'next/server';

import { makeGetSpeakingTopicUseCase } from '@/features/speaking/application/factories/get-speaking-topic.factory';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';
import { db } from '@/infrastructure/db/client';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getSpeakingAuthUser } from '../../../get-auth-user';

export type LastCompletedSessionResponse =
  | { sessionId: string; completedAt: string }
  | { sessionId: null; completedAt: null };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await getTenantFromRequest(req);
    const user = await getSpeakingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'speaking.api.notAuthenticated',
      );
    }

    const { slug } = await params;
    if (!slug) {
      throw new BadRequestError('Missing slug.', 'speaking.api.missingSlug');
    }

    const language = req.nextUrl.searchParams.get('language') ?? undefined;
    const getTopic = makeGetSpeakingTopicUseCase();
    const topic = await getTopic.execute(user.id, slug, { language });
    if (!topic) {
      return Response.json({
        sessionId: null,
        completedAt: null,
      } satisfies LastCompletedSessionResponse);
    }

    const sessionRepo = new SpeakingSessionRepository(db);
    const session = await sessionRepo.findLastCompletedByTopicAndUser(
      topic.id,
      user.id,
    );

    if (!session) {
      return Response.json({
        sessionId: null,
        completedAt: null,
      } satisfies LastCompletedSessionResponse);
    }

    return Response.json({
      sessionId: session.id,
      completedAt: session.completedAt
        ? session.completedAt.toISOString()
        : session.createdAt.toISOString(),
    } satisfies LastCompletedSessionResponse);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
