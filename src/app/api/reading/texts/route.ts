import type { NextRequest } from 'next/server';

import { makeGetReadingTextListUseCase } from '@/features/reading/application/factories/get-reading-text-list.factory';
import { ReadingSessionRepository } from '@/features/reading/infrastructure/drizzle-repositories/reading-session.repository';
import { db } from '@/infrastructure/db/client';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getReadingAuthUser } from '../get-auth-user';

export async function GET(req: NextRequest) {
  try {
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const useCase = makeGetReadingTextListUseCase();
    const result = await useCase.execute(user.id);

    const texts =
      result.kind === 'cached'
        ? (JSON.parse(result.body) as { texts: Array<{ id: string }> }).texts
        : result.texts;

    const sessionRepo = new ReadingSessionRepository(db);
    const completedIds = await sessionRepo.findCompletedTextIdsByUser(user.id);
    const completedSet = new Set(completedIds);

    const textsWithCompleted = texts.map((t) => ({
      ...t,
      completed: completedSet.has(t.id),
    }));

    if (result.kind === 'cached') {
      return Response.json(
        { texts: textsWithCompleted },
        {
          headers: {
            'Cache-Control': 'private, max-age=3600',
          },
        },
      );
    }
    return Response.json({ texts: textsWithCompleted });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
